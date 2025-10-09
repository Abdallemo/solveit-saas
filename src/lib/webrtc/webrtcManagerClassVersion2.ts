// // SignalingService.ts
// import { sendSignalMessage } from "@/features/mentore/server/action";
// import { getTurnCredentials } from "../cloudflare";

// type SignalMessage = {
// 	from: string;
// 	to: string;
// 	type: "offer" | "answer" | "candidate" | "leave";
// 	payload: any;
// 	sessionId: string;
// 	connectionType?: "main" | "screen";
// };

// type WebRTCState = {
// 	localStream: MediaStream | null;
// 	remoteStream: MediaStream | null;
// 	localScreenShare: MediaStream | null;
// 	remoteScreenShare: MediaStream | null;
// 	cameraOn: boolean;
// 	micOn: boolean;
// 	isScreenSharing: boolean;
// };

// type Subscriber = (state: WebRTCState) => void;

// interface SignalHandler {
// 	handle(message: SignalMessage): Promise<void>;
// }

// interface ManagerOptions {
// 	userId: string;
// 	sessionId: string;
// }

// class SignalingService {
// 	private ws: WebSocket | null = null;
// 	private readonly sessionId: string;
// 	private readonly handler: SignalHandler;

// 	constructor(sessionId: string, handler: SignalHandler) {
// 		this.sessionId = sessionId;
// 		this.handler = handler;
// 	}

// 	public connect() {
// 		if (typeof window === "undefined") return;
// 		this.ws = new WebSocket(
// 			`${process.env.NEXT_PUBLIC_GO_API_WS_URL}/signaling?session_id=${this.sessionId}`
// 		);
// 		this.ws.onmessage = (e) => this.handler.handle(JSON.parse(e.data));
// 	}

// 	public async send(msg: SignalMessage) {
// 		try {
// 			const messageToSend = { ...msg, connectionType: msg.connectionType || "main" };
// 			await sendSignalMessage(messageToSend);
// 		} catch (err) {
// 			console.error("Signal send error:", err);
// 		}
// 	}

// 	public close() {
// 		if (this.ws) {
// 			this.ws.onmessage = null;
// 			this.ws.close();
// 			this.ws = null;
// 		}
// 	}
// }

// const managers: Record<string, WebRTCManager> = {};

// export function getWebRTCManager(userId: string, sessionId: string) {
// 	const key = `${userId}_${sessionId}`;
// 	if (!managers[key]) {
// 		managers[key] = new WebRTCManager({ userId, sessionId });
// 	}
// 	return managers[key];
// }

// /* ------------------- BasePeer ------------------- */
// class BasePeer {
// 	public pc: RTCPeerConnection | null = null;
// 	public pendingCandidates: RTCIceCandidateInit[] = [];
// 	public makingOffer = false;
// 	private negotiationLock: Promise<void> = Promise.resolve();

// 	constructor(
// 		private readonly connectionType: "main" | "screen",
// 		private readonly sendSignal: (msg: SignalMessage) => Promise<void>,
// 		private readonly userId: string,
// 		private readonly sessionId: string,
// 		private readonly onTrack: (stream: MediaStream, track: MediaStreamTrack) => void,
// 		private readonly isPolite: () => boolean
// 	) {}

// 	private async buildIceServers(): Promise<RTCIceServer[]> {
// 		let iceServers: RTCIceServer[] = [
// 			{ urls: "stun:stun.l.google.com:19302" },
// 			{ urls: "stun:stun1.l.google.com:19302" },
// 		];
// 		try {
// 			const creds = await getTurnCredentials();
// 			if (creds?.turn?.length > 0) iceServers = [...iceServers, ...creds.turn];
// 		} catch (err) {
// 			console.warn("TURN fetch failed, continuing with STUN only");
// 		}
// 		return iceServers;
// 	}

// 	public async init() {
// 		if (this.pc) return;
// 		const iceServers = await this.buildIceServers();
// 		this.pc = new RTCPeerConnection({ iceServers });

// 		this.pc.ontrack = (e) => {
// 			const stream = e.streams[0] ?? new MediaStream([e.track]);
// 			this.onTrack(stream, e.track);
// 		};

// 		this.pc.onicecandidate = (e) => {
// 			if (e.candidate) {
// 				this.sendSignal({
// 					from: this.userId,
// 					to: "broadcast",
// 					type: "candidate",
// 					payload: e.candidate.toJSON(),
// 					sessionId: this.sessionId,
// 					connectionType: this.connectionType,
// 				});
// 			}
// 		};

// 		this.pc.onnegotiationneeded = () => this.handleNegotiation();
// 	}

// 	private async handleNegotiation() {
// 		this.negotiationLock = this.negotiationLock.then(async () => {
// 			if (!this.pc) return;
// 			try {
// 				this.makingOffer = true;
// 				const offer = await this.pc.createOffer();
// 				await this.pc.setLocalDescription(offer);
// 				await this.sendSignal({
// 					from: this.userId,
// 					to: "broadcast",
// 					type: "offer",
// 					payload: offer,
// 					sessionId: this.sessionId,
// 					connectionType: this.connectionType,
// 				});
// 			} catch (err) {
// 				console.error(`Negotiation error (${this.connectionType}):`, err);
// 			} finally {
// 				this.makingOffer = false;
// 			}
// 		});
// 	}

// 	private normalizeCandidate(raw: any): RTCIceCandidateInit | null {
// 		if (!raw) return null;
// 		let c: any = raw;
// 		if (typeof raw === "string") {
// 			const s = raw.trim();
// 			if (s.startsWith("{") || s.startsWith("[")) {
// 				try {
// 					c = JSON.parse(s);
// 				} catch (e) {
// 					c = { candidate: s };
// 				}
// 			} else {
// 				c = { candidate: s };
// 			}
// 		}
// 		if (c && c.candidate && typeof c.candidate === "string") {
// 			return { candidate: c.candidate, sdpMid: c.sdpMid, sdpMLineIndex: c.sdpMLineIndex };
// 		}
// 		try {
// 			return c as RTCIceCandidateInit;
// 		} catch {
// 			return null;
// 		}
// 	}

// 	public async handleOffer(desc: any, remoteFrom: string) {
// 		if (!this.pc) await this.init();
// 		if (!this.pc) return;
// 		const offerCollision = this.makingOffer || this.pc.signalingState !== "stable";
// 		if (!this.isPolite() && offerCollision) return;

// 		try {
// 			const description: RTCSessionDescriptionInit = typeof desc === "string" ? JSON.parse(desc) : desc;
// 			if (offerCollision) {
// 				await Promise.all([
// 					this.pc.setLocalDescription({ type: "rollback" } as any),
// 					this.pc.setRemoteDescription(new RTCSessionDescription(description)),
// 				]);
// 			} else {
// 				await this.pc.setRemoteDescription(new RTCSessionDescription(description));
// 			}

// 			for (const c of this.pendingCandidates) {
// 				if (!c) continue;
// 				try {
// 					await this.pc.addIceCandidate(new RTCIceCandidate(c));
// 				} catch (e) {
// 					console.warn("Failed to add queued candidate:", e, c);
// 				}
// 			}
// 			this.pendingCandidates = [];

// 			const answer = await this.pc.createAnswer();
// 			await this.pc.setLocalDescription(answer);
// 			await this.sendSignal({
// 				from: this.userId,
// 				to: remoteFrom,
// 				type: "answer",
// 				payload: answer,
// 				sessionId: this.sessionId,
// 				connectionType: this.connectionType,
// 			});
// 		} catch (err) {
// 			console.error(`Offer error (${this.connectionType}):`, err);
// 		}
// 	}

// 	public async handleAnswer(desc: any) {
// 		if (!this.pc) await this.init();
// 		if (!this.pc) return;
// 		try {
// 			const description: RTCSessionDescriptionInit = typeof desc === "string" ? JSON.parse(desc) : desc;
// 			await this.pc.setRemoteDescription(new RTCSessionDescription(description));
// 			for (const c of this.pendingCandidates) {
// 				if (!c) continue;
// 				try {
// 					await this.pc.addIceCandidate(new RTCIceCandidate(c));
// 				} catch (e) {
// 					console.warn("Failed to add queued candidate:", e, c);
// 				}
// 			}
// 			this.pendingCandidates = [];
// 		} catch (err) {
// 			console.error(`Answer error (${this.connectionType}):`, err);
// 		}
// 	}

// 	public async handleCandidate(raw: any) {
// 		const candInit = this.normalizeCandidate(raw?.candidate ?? raw);
// 		if (!candInit) return;
// 		if (!this.pc || !this.pc.remoteDescription || !this.pc.remoteDescription.type) {
// 			this.pendingCandidates.push(candInit);
// 			return;
// 		}
// 		try {
// 			await this.pc.addIceCandidate(new RTCIceCandidate(candInit));
// 		} catch (err) {
// 			console.error(`Candidate error (${this.connectionType}):`, err);
// 		}
// 	}

// 	public async close() {
// 		if (this.pc) {
// 			try {
// 				this.pc.close();
// 			} catch (e) {}
// 			this.pc = null;
// 		}
// 		this.pendingCandidates = [];
// 	}
// }

// /* ------------------- VideoPeer & ScreenPeer ------------------- */
// class VideoPeer extends BasePeer {
// 	public async addLocalStream(stream: MediaStream) {
// 		if (!this.pc) await this.init();
// 		if (!this.pc) return;
// 		// try replace existing senders first
// 		const videoTrack = stream.getVideoTracks()[0];
// 		const audioTrack = stream.getAudioTracks()[0];

// 		if (videoTrack) {
// 			const sender = this.pc.getSenders().find((s) => s.track?.kind === "video");
// 			if (sender) {
// 				await sender.replaceTrack(videoTrack);
// 			} else {
// 				this.pc.addTrack(videoTrack, stream);
// 			}
// 		}

// 		if (audioTrack) {
// 			const sender = this.pc.getSenders().find((s) => s.track?.kind === "audio");
// 			if (sender) {
// 				await sender.replaceTrack(audioTrack);
// 			} else {
// 				this.pc.addTrack(audioTrack, stream);
// 			}
// 		}
// 	}
// }

// class ScreenPeer extends BasePeer {
// 	public async addLocalScreenTrack(videoTrack: MediaStreamTrack, stream: MediaStream) {
// 		if (!this.pc) await this.init();
// 		if (!this.pc) return;
// 		const sender = this.pc.getSenders().find((s) => s.track?.kind === "video");
// 		if (sender) {
// 			await sender.replaceTrack(videoTrack);
// 		} else {
// 			this.pc.addTrack(videoTrack, stream);
// 		}
// 	}

// 	public async configureScreenSenderParams() {
// 		if (!this.pc) return;
// 		const sender = this.pc.getSenders().find((s) => s.track?.kind === "video");
// 		if (!sender) return;
// 		const params = sender.getParameters();
// 		params.encodings ??= [{}];
// 		params.encodings[0].maxBitrate = 2_500_000;
// 		params.encodings[0].maxFramerate = 30;
// 		try {
// 			await sender.setParameters(params);
// 		} catch (e) {}
// 	}
// }

// /* ------------------- WebRTCManager (public API preserved) ------------------- */
// class WebRTCManager implements SignalHandler {
// 	private pc: RTCPeerConnection | null = null;
// 	private screenPc: RTCPeerConnection | null = null;
// 	private signaling: SignalingService;
// 	private localStream: MediaStream | null = null;
// 	private remoteStream: MediaStream | null = null;
// 	private localScreenShare: MediaStream | null = null;
// 	private remoteScreenShare: MediaStream | null = null;
// 	private subscribers = new Set<Subscriber>();

// 	private videoPeer: VideoPeer | null = null;
// 	private screenPeer: ScreenPeer | null = null;

// 	private readonly userId: string;
// 	private readonly sessionId: string;
// 	private makingOfferMain = false;
// 	private makingOfferScreen = false;
// 	private isPolite = true;
// 	private isScreenSharing = false;
// 	private cameraOn = true;
// 	private micOn = true;

// 	constructor({ userId, sessionId }: ManagerOptions) {
// 		this.userId = userId;
// 		this.sessionId = sessionId;
// 		this.signaling = new SignalingService(sessionId, this);
// 		this.init();
// 	}

// 	private notify() {
// 		const state: WebRTCState = {
// 			localStream: this.localStream,
// 			remoteStream: this.remoteStream,
// 			cameraOn: this.cameraOn,
// 			micOn: this.micOn,
// 			localScreenShare: this.localScreenShare,
// 			remoteScreenShare: this.remoteScreenShare,
// 			isScreenSharing: this.isScreenSharing,
// 		};
// 		this.subscribers.forEach((cb) => cb(state));
// 	}

// 	private async init() {
// 		if (typeof window === "undefined") return;
// 		try {
// 			await this.initPeerConnection();
// 			await this.initLocalStream();
// 			this.signaling.connect();
// 		} catch (error) {
// 			console.error(error);
// 		}
// 	}

// 	private createSendSignalFn() {
// 		return (msg: SignalMessage) => this.signaling.send(msg);
// 	}

// 	private async initPeerConnection() {
// 		this.videoPeer = new VideoPeer(
// 			"main",
// 			this.createSendSignalFn(),
// 			this.userId,
// 			this.sessionId,
// 			(stream, track) => {
// 				const label = (track.label || "").toLowerCase();
// 				if (label.includes("screen") || label.includes("display")) {
// 					this.remoteScreenShare = stream;
// 				} else {
// 					this.remoteStream = stream;
// 				}
// 				this.notify();
// 			},
// 			() => this.isPolite
// 		);
// 		await this.videoPeer.init();
// 		this.pc = this.videoPeer.pc;
// 	}

// 	private async initLocalStream() {
// 		try {
// 			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
// 			this.localStream = stream;
// 			if (this.videoPeer) await this.videoPeer.addLocalStream(stream);
// 			this.notify();
// 			this.configureVideoTransceiver();
// 		} catch (err) {
// 			console.error("getUserMedia error:", err);
// 		}
// 	}

// 	private async initLocalScreenStream() {
// 		if (this.screenPeer) return;
// 		try {
// 			await this.ensureScreenPeer();
// 			const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: false });
// 			const videoTrack = screenStream.getVideoTracks()[0];
// 			if (!videoTrack) return;
// 			this.localScreenShare = new MediaStream([videoTrack]);
// 			this.isScreenSharing = true;
// 			await this.screenPeer!.addLocalScreenTrack(videoTrack, screenStream);
// 			await this.screenPeer!.configureScreenSenderParams();
// 			videoTrack.onended = async () => {
// 				await this.toggleScreenShare(false);
// 				this.remoteScreenShare = null;
// 			};
// 			this.notify();
// 		} catch (err) {
// 			console.error("getDisplayMedia error:", err);
// 		}
// 	}

// 	private async ensureScreenPeer() {
// 		if (this.screenPeer) return;
// 		this.screenPeer = new ScreenPeer(
// 			"screen",
// 			this.createSendSignalFn(),
// 			this.userId,
// 			this.sessionId,
// 			(stream) => {
// 				/* screen remote handled in manager */
// 				this.remoteScreenShare = stream;
// 				this.notify();
// 			},
// 			() => this.isPolite
// 		);
// 		await this.screenPeer.init();
// 		this.screenPc = this.screenPeer.pc;
// 	}

// 	private async configureVideoTransceiver() {
// 		if (!this.pc) return;
// 		const transceiver = this.pc.getTransceivers().find((t) => t.sender.track?.kind === "video");
// 		if (!transceiver) return;
// 		const codecs = RTCRtpSender.getCapabilities("video")?.codecs || [];
// 		const h264 = codecs.filter((c) => c.mimeType === "video/H264");
// 		const rest = codecs.filter((c) => c.mimeType !== "video/H264");
// 		try {
// 			transceiver.setCodecPreferences([...h264, ...rest]);
// 		} catch (err) {}
// 		const sender = transceiver.sender;
// 		const params = sender.getParameters();
// 		params.encodings ??= [{}];
// 		params.encodings[0].maxBitrate = 1_000_000;
// 		params.encodings[0].maxFramerate = 30;
// 		params.encodings[0].priority = "high" as any;
// 		try {
// 			await sender.setParameters(params);
// 		} catch (e) {}
// 	}

// 	public async handle(msg: SignalMessage) {
// 		if (msg.from === this.userId || (msg.to !== this.userId && msg.to !== "broadcast")) return;

// 		const connectionType = msg.connectionType || msg.payload?.peer || (msg.payload?.desc?.peer) || (msg.payload?.candidate?.peer) || "main";

// 		try {
// 			if (connectionType === "screen") {
// 				if (!this.screenPeer) await this.ensureScreenPeer();
// 				if (!this.screenPeer) return;
// 				if (msg.type === "offer") {
// 					const desc = msg.payload?.desc ?? msg.payload;
// 					await this.screenPeer.handleOffer(desc, msg.from);
// 				} else if (msg.type === "answer") {
// 					const desc = msg.payload?.desc ?? msg.payload;
// 					await this.screenPeer.handleAnswer(desc);
// 				} else if (msg.type === "candidate") {
// 					await this.screenPeer.handleCandidate(msg.payload?.candidate ?? msg.payload);
// 				} else if (msg.type === "leave") {
// 					this.handleScreenLeave();
// 				}
// 			} else {
// 				if (!this.videoPeer) return;
// 				if (msg.type === "offer") {
// 					await this.videoPeer.handleOffer(msg.payload, msg.from);
// 				} else if (msg.type === "answer") {
// 					await this.videoPeer.handleAnswer(msg.payload);
// 				} else if (msg.type === "candidate") {
// 					await this.videoPeer.handleCandidate(msg.payload);
// 				} else if (msg.type === "leave") {
// 					this.handleLeave();
// 				}
// 			}
// 		} catch (err) {
// 			console.error("Error handling signal:", err);
// 		}
// 	}

// 	private handleLeave() {
// 		setTimeout(() => {
// 			this.remoteStream = null;
// 			this.remoteScreenShare = null;
// 			this.notify();
// 		}, 300);
// 	}

// 	private handleScreenLeave() {
// 		if (this.localScreenShare) {
// 			this.localScreenShare.getTracks().forEach((t) => t.stop());
// 			this.localScreenShare = null;
// 		}
// 		this.isScreenSharing = false;
// 		if (this.screenPeer) {
// 			try {
// 				this.screenPeer.close();
// 			} catch (e) {}
// 			this.screenPeer = null;
// 			this.screenPc = null;
// 		}
// 		this.remoteScreenShare = null;
// 		this.notify();
// 	}

// 	public subscribe(cb: Subscriber) {
// 		this.subscribers.add(cb);
// 		cb({
// 			localStream: this.localStream,
// 			remoteStream: this.remoteStream,
// 			localScreenShare: this.localScreenShare,
// 			remoteScreenShare: this.remoteScreenShare,
// 			cameraOn: this.cameraOn,
// 			micOn: this.micOn,
// 			isScreenSharing: this.isScreenSharing,
// 		});
// 		return () => this.subscribers.delete(cb);
// 	}

// 	public toggleCamera = (on: boolean) => {
// 		this.cameraOn = on;
// 		this.localStream?.getVideoTracks().forEach((t) => (t.enabled = on));
// 		this.notify();
// 	};

// 	public toggleMic = (on: boolean) => {
// 		this.micOn = on;
// 		this.localStream?.getAudioTracks().forEach((t) => (t.enabled = on));
// 		this.notify();
// 	};

// 	public toggleScreenShare = async (on: boolean) => {
// 		if (on) {
// 			if (this.screenPeer) return;
// 			await this.initLocalScreenStream();
// 		} else {
// 			if (this.localScreenShare) {
// 				this.localScreenShare.getTracks().forEach((t) => t.stop());
// 				this.localScreenShare = null;
// 			}
// 			this.isScreenSharing = false;
// 			if (this.screenPeer) {
// 				try {
// 					this.screenPeer.close();
// 				} catch (e) {}
// 				this.screenPeer = null;
// 				this.screenPc = null;
// 			}
// 			this.screenTransceiver = null;
// 			this.remoteScreenShare = null;
// 			this.notify();
// 		}
// 	};

// 	public async listDevices() {
// 		const devices = await navigator.mediaDevices.enumerateDevices();
// 		return {
// 			cameras: devices.filter((d) => d.kind === "videoinput"),
// 			microphones: devices.filter((d) => d.kind === "audioinput"),
// 		};
// 	}

// 	public async switchCamera(deviceId: string) {
// 		if (!this.localStream) return;
// 		const newStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } }, audio: false });
// 		const newTrack = newStream.getVideoTracks()[0];
// 		const sender = this.pc?.getSenders().find((s) => s.track?.kind === "video");
// 		if (sender && newTrack) await sender.replaceTrack(newTrack);
// 		this.localStream = newStream;
// 		this.notify();
// 	}

// 	public async switchMic(deviceId: string) {
// 		if (!this.localStream) return;
// 		const newStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId } }, video: false });
// 		const newTrack = newStream.getAudioTracks()[0];
// 		const sender = this.pc?.getSenders().find((s) => s.track?.kind === "audio");
// 		if (sender && newTrack) await sender.replaceTrack(newTrack);
// 		const oldAudio = this.localStream.getAudioTracks()[0];
// 		if (oldAudio) {
// 			this.localStream.removeTrack(oldAudio);
// 			oldAudio.stop();
// 		}
// 		this.localStream.addTrack(newTrack);
// 		this.notify();
// 	}

// 	public leaveCall = async () => {
// 		try {
// 			await this.signaling.send({ from: this.userId, to: "broadcast", type: "leave", payload: null, sessionId: this.sessionId });
// 		} catch (err) {
// 			console.error("Error sending leave signal:", err);
// 		}

// 		if (this.localStream) {
// 			this.localStream.getTracks().forEach((t) => t.stop());
// 			this.localStream = null;
// 		}
// 		this.remoteStream = null;
// 		if (this.screenPeer) {
// 			try {
// 				this.screenPeer.close();
// 			} catch (e) {}
// 			this.screenPeer = null;
// 			this.screenPc = null;
// 		}
// 		this.screenTransceiver = null;
// 		this.localScreenShare?.getTracks().forEach((t) => t.stop());
// 		this.localScreenShare = null;
// 		this.remoteScreenShare = null;

// 		if (this.videoPeer) {
// 			try {
// 				this.videoPeer.close();
// 			} catch (e) {}
// 			this.videoPeer = null;
// 			this.pc = null;
// 		}

// 		this.signaling.close();
// 		this.cameraOn = false;
// 		this.micOn = false;
// 		this.notify();
// 		const key = `${this.userId}_${this.sessionId}`;
// 		delete managers[key];
// 	};
// }
