// SignalingService.ts
import { sendSignalMessage } from "@/features/mentore/server/action";
import { getTurnCredentials } from "./cloudflare";
type SignalMessage = {
  from: string;
  to: string;
  type: "offer" | "answer" | "candidate" | "leave";
  payload: any;
  sessionId: string;
};
type WebRTCState = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  localScreenShare: MediaStream | null;
  remoteScreenShare: MediaStream | null;
  cameraOn: boolean;
  micOn: boolean;
  isScreenSharing: boolean;
};

type Subscriber = (state: WebRTCState) => void;

interface SignalHandler {
  handle(message: SignalMessage): Promise<void>;
}

interface ManagerOptions {
  userId: string;
  sessionId: string;
}

class SignalingService {
  private ws: WebSocket | null = null;
  private readonly sessionId: string;
  private readonly handler: SignalHandler;

  constructor(sessionId: string, handler: SignalHandler) {
    this.sessionId = sessionId;
    this.handler = handler;
  }

  public connect() {
    if (typeof window === "undefined") return;
    this.ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_GO_API_WS_URL}/signaling?session_id=${this.sessionId}`
    );
    this.ws.onmessage = (e) => this.handler.handle(JSON.parse(e.data));
  }

  public async send(msg: SignalMessage) {
    try {
      await sendSignalMessage(msg);
    } catch (err) {
      console.error("Signal send error:", err);
    }
  }

  public close() {
    if (this.ws) {
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
  }
}

const managers: Record<string, WebRTCManager> = {};

export function getWebRTCManager(userId: string, sessionId: string) {
  const key = `${userId}_${sessionId}`;
  if (!managers[key]) {
    managers[key] = new WebRTCManager({ userId, sessionId });
  }
  return managers[key];
}

class WebRTCManager implements SignalHandler {
  private pc: RTCPeerConnection | null = null;
  private signaling: SignalingService;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private localScreenShare: MediaStream | null = null;
  private remoteScreenShare: MediaStream | null = null;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private subscribers = new Set<Subscriber>();
  private screenTransceiver: RTCRtpTransceiver | null = null;
  private readonly userId: string;
  private readonly sessionId: string;
  private makingOffer = false;
  private isPolite = true;
  private isScreenSharing = false;
  private cameraOn = true;
  private micOn = true;

  constructor({ userId, sessionId }: ManagerOptions) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.signaling = new SignalingService(sessionId, this);
    this.init();
  }
  private notify() {
    const state: WebRTCState = {
      localStream: this.localStream,
      remoteStream: this.remoteStream,
      cameraOn: this.cameraOn,
      micOn: this.micOn,
      localScreenShare: this.localScreenShare,
      remoteScreenShare: this.remoteScreenShare,
      isScreenSharing: this.isScreenSharing,
    };
    console.log("manager state changed");
    this.subscribers.forEach((cb) => cb(state));
  }

  private async init() {
    if (typeof window === "undefined") return;
    try {
      await this.initPeerConnection();
      await this.initLocalStream();
      this.signaling.connect();
    } catch (error) {
      console.error(error);
    }
  }

  private async initPeerConnection() {
    let iceServers: RTCIceServer[] = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ];
    try {
      const creds = await getTurnCredentials();
      if (creds?.turn.length > 0) {
        iceServers = [...iceServers, ...creds.turn];
      }
    } catch {
      console.warn("TURN fetch failed, continuing with STUN only");
    }

    this.pc = new RTCPeerConnection({ iceServers });

    this.pc.ontrack = (e) => {
      let stream = e.streams[0] ?? new MediaStream([e.track]);

      const track = e.track;
      const label = track.label.toLowerCase();

      if (label.includes("screen") || label.includes("display")) {
        console.log("Detected screen share track:", label);
        this.remoteScreenShare = stream;
      } else {
        console.log("Detected camera/mic track:", label);
        this.remoteStream = stream;
      }

      this.notify();
    };

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.signaling.send({
          from: this.userId,
          to: "broadcast",
          type: "candidate",
          payload: e.candidate.toJSON(),
          sessionId: this.sessionId,
        });
      }
    };

    this.pc.onnegotiationneeded = () => this.handleNegotiation();
  }

  private async initLocalStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this.localStream = stream;
      stream.getTracks().forEach((track) => this.pc!.addTrack(track, stream));
      this.notify();
      this.configureVideoTransceiver();
    } catch (err) {
      console.error("getUserMedia error:", err);
    }
  }
  private async initLocalScreenStream() {
    if (!this.pc) return;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
      });
      const videoTrack = screenStream.getVideoTracks()[0];
      if (!videoTrack) {
        console.error("No video track found");
        return;
      }
      this.localScreenShare = new MediaStream([videoTrack]);
      this.notify();

      console.info(
        "from initLocalScreenStream assigned localScreenShare = ",
        this.localScreenShare
      );
      this.isScreenSharing = true;

      if (this.screenTransceiver) {
        await this.screenTransceiver.sender.replaceTrack(videoTrack);
      } else {
        this.screenTransceiver = this.pc.addTransceiver(videoTrack, {
          direction: "sendrecv",
        });
      }
      this.configureScreenTransceiver();
      this.notify();
    } catch (err) {
      console.error("getUserMedia error:", err);
    }
  }

  private async configureVideoTransceiver() {
    if (!this.pc) return;
    const transceiver = this.pc
      .getTransceivers()
      .find((t) => t.sender.track?.kind === "video");

    if (transceiver) {
      const codecs = RTCRtpSender.getCapabilities("video")?.codecs || [];
      const h264 = codecs.filter((c) => c.mimeType === "video/H264");
      const rest = codecs.filter((c) => c.mimeType !== "video/H264");

      transceiver.setCodecPreferences([...h264, ...rest]);

      const sender = transceiver.sender;
      const params = sender.getParameters();
      params.encodings ??= [{}];
      params.encodings[0].maxBitrate = 1_000_000;
      params.encodings[0].maxFramerate = 30;
      params.encodings[0].priority = "high";
      await sender.setParameters(params);
    }
  }
  private async configureScreenTransceiver() {
    if (!this.pc || !this.localScreenShare || !this.screenTransceiver) return;

    const track = this.localScreenShare.getVideoTracks()[0];
    const sender = this.screenTransceiver.sender;

    try {
      const codecs = RTCRtpSender.getCapabilities("video")?.codecs || [];
      const h264 = codecs.filter((c) => c.mimeType === "video/H264");
      const rest = codecs.filter((c) => c.mimeType !== "video/H264");
      this.screenTransceiver.setCodecPreferences([...h264, ...rest]);
    } catch (err) {
      console.warn("setCodecPreferences unavailable or failed", err);
    }

    track.onended = async () => {
      await this.toggleScreenShare(false);
      this.remoteScreenShare = null;
    };

    const params = sender.getParameters();
    params.encodings ??= [{}];
    params.encodings[0].maxBitrate = 2_500_000;
    params.encodings[0].maxFramerate = 30;
    await sender.setParameters(params);
  }

  private async handleNegotiation() {
    try {
      if (!this.pc) return;
      this.makingOffer = true;
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      await this.signaling.send({
        from: this.userId,
        to: "broadcast",
        type: "offer",
        payload: offer,
        sessionId: this.sessionId,
      });
    } catch (err) {
      console.error("Negotiation error:", err);
    } finally {
      this.makingOffer = false;
    }
  }

  public async handle(msg: SignalMessage) {
    if (
      this.pc === null ||
      msg.from === this.userId ||
      (msg.to !== this.userId && msg.to !== "broadcast")
    )
      return;

    switch (msg.type) {
      case "offer":
        await this.handleOffer(msg);
        break;
      case "answer":
        await this.handleAnswer(msg);
        break;
      case "candidate":
        await this.handleCandidate(msg.payload);
        break;
      case "leave":
        this.handleLeave();
        break;
    }
  }

  private async handleOffer(msg: SignalMessage) {
    if (!this.pc) return;
    const offerCollision =
      this.makingOffer || this.pc.signalingState !== "stable";
    if (!this.isPolite && offerCollision) return;

    try {
      if (offerCollision) {
        await Promise.all([
          this.pc.setLocalDescription({ type: "rollback" }),
          this.pc.setRemoteDescription(new RTCSessionDescription(msg.payload)),
        ]);
      } else {
        await this.pc.setRemoteDescription(
          new RTCSessionDescription(msg.payload)
        );
      }

      for (const c of this.pendingCandidates) {
        await this.pc.addIceCandidate(new RTCIceCandidate(c));
      }
      this.pendingCandidates = [];

      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      await this.signaling.send({
        from: this.userId,
        to: msg.from,
        type: "answer",
        payload: answer,
        sessionId: this.sessionId,
      });
    } catch (err) {
      console.error("Offer error:", err);
    }
  }

  private async handleAnswer(msg: SignalMessage) {
    if (!this.pc) return;
    try {
      await this.pc.setRemoteDescription(
        new RTCSessionDescription(msg.payload)
      );
      for (const c of this.pendingCandidates) {
        await this.pc.addIceCandidate(new RTCIceCandidate(c));
      }
      this.pendingCandidates = [];
    } catch (err) {
      console.error("Answer error:", err);
    }
  }

  private async handleCandidate(candidate: RTCIceCandidateInit) {
    if (!this.pc) return;
    try {
      if (this.pc.remoteDescription && this.pc.remoteDescription.type) {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        this.pendingCandidates.push(candidate);
      }
    } catch (err) {
      console.error("Candidate error:", err);
    }
  }

  private handleLeave() {
    setTimeout(() => {
      if (this.remoteStream) {
        this.remoteStream = null;
        this.notify();
      }
      if (this.remoteScreenShare) {
        this.remoteScreenShare = null;
        this.notify();
      }
    }, 300);
  }

  public subscribe(cb: Subscriber) {
    this.subscribers.add(cb);
    cb({
      localStream: this.localStream,
      remoteStream: this.remoteStream,
      localScreenShare: this.localScreenShare,
      remoteScreenShare: this.remoteScreenShare,
      cameraOn: this.cameraOn,
      micOn: this.micOn,
      isScreenSharing: this.isScreenSharing,
    });
    return () => this.subscribers.delete(cb);
  }

  public toggleCamera = (on: boolean) => {
    this.cameraOn = on;
    this.localStream?.getVideoTracks().forEach((t) => (t.enabled = on));
    this.notify();
  };

  public toggleMic = (on: boolean) => {
    this.micOn = on;
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = on));
    this.notify();
  };

  public toggleScreenShare = async (on: boolean) => {
    if (!this.pc) return;

    if (on) {
      await this.initLocalScreenStream();
    } else {
      if (this.localScreenShare) {
        this.localScreenShare.getTracks().forEach((t) => t.stop());
        this.localScreenShare = null;
      }
      this.isScreenSharing = false;
      this.notify();

      if (this.screenTransceiver) {
        await this.screenTransceiver.sender.replaceTrack(null);
        this.screenTransceiver.direction = "inactive";
        this.screenTransceiver = null;
      }
    }
  };

  public async listDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      cameras: devices.filter((d) => d.kind === "videoinput"),
      microphones: devices.filter((d) => d.kind === "audioinput"),
    };
  }
  public async switchCamera(deviceId: string) {
    if (!this.localStream) return;
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
      audio: false,
    });

    const newTrack = newStream.getVideoTracks()[0];
    const sender = this.pc?.getSenders().find((s) => s.track?.kind === "video");

    if (sender && newTrack) {
      await sender.replaceTrack(newTrack);
    }

    this.localStream = newStream;
    this.notify();
  }
  public async switchMic(deviceId: string) {
    if (!this.localStream) return;
    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
      video: false,
    });

    const newTrack = newStream.getAudioTracks()[0];
    const sender = this.pc?.getSenders().find((s) => s.track?.kind === "audio");

    if (sender && newTrack) {
      await sender.replaceTrack(newTrack);
    }

    const oldAudio = this.localStream.getAudioTracks()[0];
    if (oldAudio) {
      this.localStream.removeTrack(oldAudio);
      oldAudio.stop();
    }
    this.localStream.addTrack(newTrack);
    this.notify();
  }

  public leaveCall = async () => {
    try {
      await this.signaling.send({
        from: this.userId,
        to: "broadcast",
        type: "leave",
        payload: null,
        sessionId: this.sessionId,
      });
    } catch (err) {
      console.error("Error sending leave signal:", err);
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    this.remoteStream = null;
    this.screenTransceiver = null;
    this.localScreenShare = null;
    this.remoteScreenShare = null;

    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }

    this.signaling.close();

    this.cameraOn = false;
    this.micOn = false;
    this.notify();

    const key = `${this.userId}_${this.sessionId}`;
    delete managers[key];
  };
}
