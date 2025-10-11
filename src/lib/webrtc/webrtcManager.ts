import { getTurnCredentials } from "../cloudflare";
import { SignalHandler, SignalingService } from "./signaling";
import { connType, SignalMessage } from "./types";

type WebRTCState = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  localScreenShare: MediaStream | null;
  remoteScreenShare: MediaStream | null;
  cameraOn: boolean;
  micOn: boolean;
  isScreenSharing: boolean;
  error: { type: "camera" | "screen" | "signaling"; message: string } | null;
};

type Subscriber = (state: WebRTCState) => void;

interface ManagerOptions {
  userId: string;
  sessionId: string;
}

abstract class WebRTCPeer {
  protected pc: RTCPeerConnection | null = null;
  protected readonly signaling: SignalingService;
  protected readonly userId: string;
  protected readonly sessionId: string;
  protected readonly connectionType: connType;
  protected makingOffer = false;
  protected pendingCandidates: RTCIceCandidateInit[] = [];
  protected readonly notifyManager: () => void;
  protected readonly notifyError: (
    workerType: connType,
    message: string
  ) => void;

  constructor(
    userId: string,
    sessionId: string,
    connectionType: connType,
    signaling: SignalingService,
    notifyManager: () => void,
    notifyError: (workerType: connType, message: string) => void
  ) {
    this.userId = userId;
    this.sessionId = sessionId;
    this.connectionType = connectionType;
    this.signaling = signaling;
    this.notifyManager = notifyManager;
    this.notifyError = notifyError;
  }

  public abstract getLocalStream(): MediaStream | null;
  public abstract getRemoteStream(): MediaStream | null;
  protected abstract handleRemoteTrack(e: RTCTrackEvent): void;
  public abstract init(): Promise<void>;

  protected async createPeerConnection() {
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
      console.warn("TURN fetch failed for worker:", this.connectionType);
    }

    this.pc = new RTCPeerConnection({ iceServers });

    this.pc.ontrack = (e) => this.handleRemoteTrack(e);

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.signaling.send({
          from: this.userId,
          to: "broadcast",
          type: "candidate",
          payload: e.candidate.toJSON(),
          sessionId: this.sessionId,
          connectionType: this.connectionType,
        });
      }
    };

    this.pc.onnegotiationneeded = () => this.handleNegotiation();
  }

  protected async handleNegotiation() {
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
        connectionType: this.connectionType,
      });
    } catch (err) {
      console.error(`Negotiation error for ${this.connectionType}:`, err);
      this.notifyError(
        this.connectionType,
        `Negotiation failed: ${(err as Error).message}`
      );
    } finally {
      this.makingOffer = false;
    }
  }

  public async handleSignal(msg: SignalMessage) {
    switch (msg.type) {
      case "offer":
        if (!this.pc) return;
        await this.handleOffer(msg);
        break;
      case "answer":
        if (!this.pc) return;
        await this.handleAnswer(msg);
        break;
      case "candidate":
        if (!this.pc) return;
        await this.handleCandidate(msg.payload);
        break;
      case "leave":
        this.close();
        this.notifyManager();
        break;
    }
  }

  private async handleOffer(msg: SignalMessage) {
    if (!this.pc) return;

    try {
      if (this.makingOffer || this.pc.signalingState !== "stable") {
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
        connectionType: this.connectionType,
      });
    } catch (err) {
      console.error(`Offer error for ${this.connectionType}:`, err);
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
      console.error(`Answer error for ${this.connectionType}:`, err);
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
      console.error(`Candidate error for ${this.connectionType}:`, err);
    }
  }

  public getTrackSender(kind: "video" | "audio") {
    return this.pc?.getSenders().find((s) => s.track?.kind === kind);
  }

  public async close() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }
}

class CameraShare extends WebRTCPeer {
  private localCameraShare: MediaStream | null = null;
  private remoteCameraShare: MediaStream | null = null;

  constructor(
    userId: string,
    sessionId: string,
    signaling: SignalingService,
    notifyManager: () => void,
    notifyError: (workerType: connType, message: string) => void
  ) {
    super(userId, sessionId, "camera", signaling, notifyManager, notifyError);
  }

  public getLocalStream(): MediaStream | null {
    return this.localCameraShare;
  }
  public getRemoteStream(): MediaStream | null {
    return this.remoteCameraShare;
  }

  protected handleRemoteTrack(e: RTCTrackEvent): void {
    this.remoteCameraShare = e.streams[0] ?? new MediaStream([e.track]);
    this.notifyManager();
  }

  public async init() {
    if (!this.pc) await this.createPeerConnection();
    await this.initLocalStream();
  }

  private async initLocalStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this.localCameraShare = stream;

      stream.getTracks().forEach((track) => this.pc!.addTrack(track, stream));
      this.configureTransceivers();

      this.notifyManager();
    } catch (err) {
      console.error("MainWorker: getUserMedia error:", err);
      if (this.pc && this.pc.signalingState === "stable") {
        this.pc.createOffer().then((o) => this.pc?.setLocalDescription(o));
      }
    }
  }

  public async switchMediaTrack(kind: "video" | "audio", deviceId: string) {
    if (!this.pc) return;

    const isVideo = kind === "video";
    const constraints: MediaStreamConstraints = isVideo
      ? { video: { deviceId: { exact: deviceId } }, audio: false }
      : { audio: { deviceId: { exact: deviceId } }, video: false };

    const newStream = await navigator.mediaDevices.getUserMedia(constraints);
    const newTrack = newStream.getTracks().find((t) => t.kind === kind);
    const sender = this.getTrackSender(kind);

    if (sender && newTrack) {
      await sender.replaceTrack(newTrack);
    }

    const oldTrack = this.localCameraShare
      ?.getTracks()
      .find((t) => t.kind === kind);
    if (oldTrack) {
      this.localCameraShare!.removeTrack(oldTrack);
      oldTrack.stop();
    }
    if (this.localCameraShare && newTrack) {
      this.localCameraShare.addTrack(newTrack);
    } else {
      this.localCameraShare = newStream;
    }

    this.notifyManager();
  }

  private async configureTransceivers() {
    if (!this.pc) return;
    const videoTransceiver = this.pc
      .getTransceivers()
      .find((t) => t.sender.track?.kind === "video");

    if (videoTransceiver) {
      const codecs = RTCRtpSender.getCapabilities("video")?.codecs || [];
      const h264 = codecs.filter((c) => c.mimeType === "video/H264");
      const rest = codecs.filter((c) => c.mimeType !== "video/H264");
      videoTransceiver.setCodecPreferences([...h264, ...rest]);

      const sender = videoTransceiver.sender;
      const params = sender.getParameters();
      params.encodings ??= [{}];
      params.encodings[0].maxFramerate = 30;
      params.encodings[0].priority = "high";
      await sender.setParameters(params);
    }
  }
  public override async handleSignal(msg: SignalMessage) {
    if (msg.type === "leave") {
      this.remoteCameraShare = null;
      this.notifyManager();
      return;
    }

    return super.handleSignal(msg);
  }
  private localCleanup() {
    if (this.localCameraShare) {
      this.localCameraShare.getTracks().forEach((t) => t.stop());
      this.localCameraShare = null;
    }
  }
  public override async close() {
    this.localCleanup();
    this.remoteCameraShare = null;
    await super.close();
  }
}

class ScreenShare extends WebRTCPeer {
  private localScreenShare: MediaStream | null = null;
  private remoteScreenShare: MediaStream | null = null;
  private screenSender: RTCRtpSender | null = null;

  constructor(
    userId: string,
    sessionId: string,
    signaling: SignalingService,
    notifyManager: () => void,
    notifyError: (workerType: connType, message: string) => void
  ) {
    super(userId, sessionId, "screen", signaling, notifyManager, notifyError);
  }

  public async init() {}

  public getLocalStream(): MediaStream | null {
    return this.localScreenShare;
  }
  public getRemoteStream(): MediaStream | null {
    return this.remoteScreenShare;
  }

  protected handleRemoteTrack(e: RTCTrackEvent): void {
    e.track.onended = () => {
      if (this.remoteScreenShare) {
        this.remoteScreenShare = null;
        this.notifyManager();
      }
    };

    this.remoteScreenShare = e.streams[0] ?? new MediaStream([e.track]);
    this.notifyManager();
  }
  public async startScreenShare() {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: false,
    });
    const videoTrack = screenStream.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.contentHint = "text";
    this.localScreenShare = new MediaStream([videoTrack]);

    if (!this.pc) {
      await this.createPeerConnection();
    }

    const existingSender = this.getTrackSender("video");

    if (existingSender) {
      await existingSender.replaceTrack(videoTrack);
      this.screenSender = existingSender;
    } else {
      this.screenSender = this.pc!.addTrack(videoTrack, this.localScreenShare);
    }

    videoTrack.onended = async () => {
      await this.stopScreenShare();
    };
    this.configureTransceiver(this.screenSender);

    this.notifyManager();
  }

  public override async handleSignal(msg: SignalMessage) {
    if (msg.type === "stopScreen") {
      this.remoteScreenShare = null;
      this.notifyManager();
      return;
    }
    if (!this.pc && (msg.type === "offer" || msg.type === "candidate")) {
      await this.createPeerConnection();
    }

    return super.handleSignal(msg);
  }

  private async configureTransceiver(sender: RTCRtpSender) {
    if (!this.pc) return;

    try {
      const transceiver = this.pc
        .getTransceivers()
        .find((t) => t.sender === sender);
      if (transceiver) {
        const codecs = RTCRtpSender.getCapabilities("video")?.codecs || [];
        const h264 = codecs.filter((c) => c.mimeType === "video/H264");
        const rest = codecs.filter((c) => c.mimeType !== "video/H264");
        transceiver.setCodecPreferences([...h264, ...rest]);
      }
    } catch (err) {
      console.warn("setCodecPreferences unavailable or failed for screen", err);
    }

    // const params = sender.getParameters();
    // params.encodings ??= [{}];
    // params.encodings[0].maxBitrate = 10_000_000;
    // params.encodings[0].maxFramerate = 30;
    // await sender.setParameters(params);
  }
  private localCleanup() {
    if (this.localScreenShare) {
      this.localScreenShare.getTracks().forEach((t) => t.stop());
      this.localScreenShare = null;
    }

    if (this.pc && this.screenSender) {
      this.pc.removeTrack(this.screenSender);
    }
    this.screenSender = null;
  }
  public async stopScreenShare() {
    await this.signaling.send({
      from: this.userId,
      to: "broadcast",
      type: "stopScreen",
      payload: null,
      sessionId: this.sessionId,
      connectionType: "screen",
    });
    this.localCleanup();
    this.notifyManager();
  }

  public override async close() {
    this.localCleanup();

    this.notifyManager();

    await super.close();
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
  private readonly userId: string;
  private readonly sessionId: string;
  private signaling: SignalingService;
  private subscribers = new Set<Subscriber>();

  private cameraWorker: CameraShare;
  private screenWorker: ScreenShare;

  private cameraOn = true;
  private micOn = true;
  private currentError: WebRTCState["error"] = null;

  constructor({ userId, sessionId }: ManagerOptions) {
    this.userId = userId;
    this.sessionId = sessionId;

    this.signaling = new SignalingService(sessionId, this);

    this.cameraWorker = new CameraShare(
      userId,
      sessionId,
      this.signaling,
      () => this.notify(),
      (workerType: connType, message: string) =>
        this.handleWorkerError(workerType, message)
    );
    this.screenWorker = new ScreenShare(
      userId,
      sessionId,
      this.signaling,
      () => this.notify(),
      (workerType: connType, message: string) =>
        this.handleWorkerError(workerType, message)
    );
  }
  private handleWorkerError = (type: connType, message: string) => {
    console.error(`[Worker Error - ${type}]: ${message}`);
    this.currentError = { type, message };
    this.notify();
  };

  private notify() {
    const localScreen = this.screenWorker.getLocalStream();
    // const s = this.cameraWorker.getLocalStream();

    const state: WebRTCState = {
      localStream: this.cameraWorker.getLocalStream(),
      remoteStream: this.cameraWorker.getRemoteStream(),
      localScreenShare: localScreen,
      remoteScreenShare: this.screenWorker.getRemoteStream(),
      cameraOn: this.cameraOn,
      micOn: this.micOn,
      isScreenSharing: !!localScreen,
      error: this.currentError,
    };
    this.subscribers.forEach((cb) => cb(state));
    this.currentError = null;
  }

  public async handle(msg: SignalMessage) {
    if (
      msg.from === this.userId ||
      (msg.to !== this.userId && msg.to !== "broadcast")
    )
      return;

    const connectionType = msg.connectionType || "camera";

    if (connectionType === "camera") {
      await this.cameraWorker.handleSignal(msg);
    } else if (connectionType === "screen") {
      await this.screenWorker.handleSignal(msg);
    }
  }

  public subscribe(cb: Subscriber) {
    this.subscribers.add(cb);
    this.notify();
    return () => this.subscribers.delete(cb);
  }

  public toggleCamera = (on: boolean) => {
    this.cameraOn = on;
    this.cameraWorker
      .getLocalStream()
      ?.getVideoTracks()
      .forEach((t) => (t.enabled = on));
    this.notify();
  };

  public toggleMic = (on: boolean) => {
    this.micOn = on;
    this.cameraWorker
      .getLocalStream()
      ?.getAudioTracks()
      .forEach((t) => (t.enabled = on));
    this.notify();
  };

  public toggleScreenShare = async (on: boolean) => {
    if (on) {
      await this.screenWorker.startScreenShare();
    } else {
      await this.screenWorker.stopScreenShare();
    }
  };

  public async switchCamera(deviceId: string) {
    await this.cameraWorker.switchMediaTrack("video", deviceId);
  }

  public async switchMic(deviceId: string) {
    await this.cameraWorker.switchMediaTrack("audio", deviceId);
  }

  public async listDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      cameras: devices.filter((d) => d.kind === "videoinput"),
      microphones: devices.filter((d) => d.kind === "audioinput"),
    };
  }

  public startCall = async () => {
    if (typeof window === "undefined") return;
    try {
      await this.cameraWorker.init();
      this.signaling.connect();
    } catch (error) {
      console.error("Manager initialization error:", error);
    }
  };
  public leaveCall = async () => {
    try {
      if (this.screenWorker.getLocalStream()) {
        await this.screenWorker.stopScreenShare();
      }
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

    await this.cameraWorker.close();
    await this.screenWorker.close();
    this.signaling.close();

    this.cameraOn = false;
    this.micOn = false;
    this.notify();

    const key = `${this.userId}_${this.sessionId}`;
    delete managers[key];
  };
}
