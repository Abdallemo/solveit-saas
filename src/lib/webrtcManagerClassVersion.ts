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
  cameraOn: boolean;
  micOn: boolean;
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
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private makingOffer = false;
  private isPolite = true;
  private subscribers = new Set<Subscriber>();

  private cameraOn = true;
  private micOn = true;
  private readonly userId: string;
  private readonly sessionId: string;

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
    };
    this.subscribers.forEach((cb) => cb(state));
  }

  private async init() {
    if (typeof window === "undefined") return;

    await this.initPeerConnection();
    await this.initLocalStream();
    this.signaling.connect();
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
      this.remoteStream = e.streams[0];
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
    }, 300);
  }

  public subscribe(cb: Subscriber) {
    this.subscribers.add(cb);
    cb({
      localStream: this.localStream,
      remoteStream: this.remoteStream,
      cameraOn: this.cameraOn,
      micOn: this.micOn,
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
