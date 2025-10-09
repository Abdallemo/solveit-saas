import { sendSignalMessage } from "@/features/mentore/server/action";
import { getTurnCredentials } from "../cloudflare";

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

interface ManagerOptions {
  userId: string;
  sessionId: string;
}

const managers: Record<string, ReturnType<typeof createWebRTCManager>> = {};

export function getWebRTCManager(userId: string, sessionId: string) {
  const key = `${userId}_${sessionId}`;
  if (!managers[key]) {
    managers[key] = createWebRTCManager({ userId, sessionId });
  }
  return managers[key];
}

function createWebRTCManager({ userId, sessionId }: ManagerOptions) {
  let pc: RTCPeerConnection | null = null;
  let ws: WebSocket | null = null;
  let localStream: MediaStream | null = null;
  let remoteStream: MediaStream | null = null;
  let pendingCandidates: RTCIceCandidateInit[] = [];
  let makingOffer = false;
  const isPolite = true;
  const subscribers = new Set<Subscriber>();
  let cameraOn = true;
  let micOn = true;

  function notify() {
    const state: WebRTCState = { localStream, remoteStream, cameraOn, micOn };
    subscribers.forEach((cb) => cb(state));
  }

  function subscribe(cb: Subscriber) {
    subscribers.add(cb);
    cb({ localStream, remoteStream, cameraOn, micOn });
    return () => subscribers.delete(cb);
  }

  async function sendSignal(msg: SignalMessage) {
    try {
      await sendSignalMessage(msg);
    } catch (err) {
      console.error("Signal send error:", err);
    }
  }

  async function handleSignal(msg: SignalMessage) {
    if (msg.from === userId || (msg.to !== userId && msg.to !== "broadcast"))
      return;
    if (!pc) return;

    switch (msg.type) {
      case "offer": {
        const offerCollision = makingOffer || pc.signalingState !== "stable";
        if (!isPolite && offerCollision) return;

        try {
          if (offerCollision) {
            await Promise.all([
              pc.setLocalDescription({ type: "rollback" }),
              pc.setRemoteDescription(new RTCSessionDescription(msg.payload)),
            ]);
          } else {
            await pc.setRemoteDescription(
              new RTCSessionDescription(msg.payload)
            );
          }

          for (const c of pendingCandidates) {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingCandidates = [];

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal({
            from: userId,
            to: msg.from,
            type: "answer",
            payload: answer,
            sessionId,
          });
        } catch (err) {
          console.error("Offer error:", err);
        }
        break;
      }

      case "answer": {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
          for (const c of pendingCandidates) {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingCandidates = [];
        } catch (err) {
          console.error("Answer error:", err);
        }
        break;
      }

      case "candidate": {
        try {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
          } else {
            pendingCandidates.push(msg.payload);
          }
        } catch (err) {
          console.error("Candidate error:", err);
        }
        break;
      }

      case "leave": {
        setTimeout(() => {
          if (remoteStream) {
            remoteStream = null;
            notify();
          }
        }, 300);
        break;
      }
    }
  }

  async function init() {
    if (typeof window === "undefined") return;
    let iceServers: RTCIceServer[] = [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ];
    try {
      const creds = await getTurnCredentials();
      if (creds?.turn.length > 0) {
        iceServers = [...iceServers, ...creds.turn];
      }
    } catch {
      console.warn("TURN fetch failed, continuing with STUN only");
    }

    pc = new RTCPeerConnection({ iceServers });

    pc.ontrack = (e) => {
      remoteStream = e.streams[0];
      notify();
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({
          from: userId,
          to: "broadcast",
          type: "candidate",
          payload: e.candidate.toJSON(),
          sessionId,
        });
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        if (!pc) return;
        makingOffer = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendSignal({
          from: userId,
          to: "broadcast",
          type: "offer",
          payload: offer,
          sessionId,
        });
      } finally {
        makingOffer = false;
      }
    };

    ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_GO_API_WS_URL}/signaling?session_id=${sessionId}`
    );
    ws.onmessage = (e) => handleSignal(JSON.parse(e.data));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStream = stream;
      stream.getTracks().forEach((track) => pc!.addTrack(track, stream));
      notify();

      const transceiver = pc
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
        params.encodings[0].maxBitrate = 5_000_000;
        params.encodings[0].maxFramerate = 30;
        params.encodings[0].priority = "high";
        await sender.setParameters(params);
      }
    } catch (err) {
      console.error("getUserMedia error:", err);
    }
  }

  function toggleCamera(on: boolean) {
    cameraOn = on;
    localStream?.getVideoTracks().forEach((t) => (t.enabled = on));
    notify();
  }

  function toggleMic(on: boolean) {
    micOn = on;
    localStream?.getAudioTracks().forEach((t) => (t.enabled = on));
    notify();
  }

  async function leaveCall() {
    try {
      await sendSignal({
        from: userId,
        to: "broadcast",
        type: "leave",
        payload: null,
        sessionId,
      });
    } catch (err) {
      console.error("Error sending leave signal:", err);
    }

    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      localStream = null;
    }

    remoteStream = null;

    if (pc) {
      try {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.onnegotiationneeded = null;
        pc.oniceconnectionstatechange = null;
        pc.close();
      } catch (err) {
        console.error("Error closing peer connection:", err);
      }
      pc = null;
    }
    if (ws) {
      try {
        ws.onmessage = null;
        ws.close();
      } catch (err) {
        console.error("Error closing WebSocket:", err);
      }
      ws = null;
    }

    cameraOn = false;
    micOn = false;

    notify();

    const key = `${userId}_${sessionId}`;
    delete managers[key];
  }

  init();

  return { subscribe, toggleCamera, toggleMic, leaveCall };
}
