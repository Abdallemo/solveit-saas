"use client";

import { sendSignalMessage } from "@/features/mentore/server/action";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket from "./useWebSocket";

type SignalMessage = {
  from: string;
  to: string;
  type: "offer" | "answer" | "candidate" | "leave";
  payload: any;
  sessionId: string;
};

export function useMentorshipCall(userId: string, sessionId: string) {
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const isPolite = true;

  const { mutateAsync: sendSignal } = useMutation({
    mutationFn: async (msg: SignalMessage) => {
      await sendSignalMessage(msg);
    },
    onError: (e) => console.error(e.message),
  });

  const endCall = useCallback(async () => {
    await sendSignal({
      from: userId,
      to: "broadcast",
      type: "leave",
      payload: null,
      sessionId,
    });

    pendingCandidates.current = [];
    makingOfferRef.current = false;
    ignoreOfferRef.current = false;
  }, [sendSignal, sessionId, userId]);

  const handleSignalMessage = async (msg: SignalMessage) => {
    if (msg.from === userId || (msg.to !== userId && msg.to !== "broadcast"))
      return;

    const pc = pcRef.current;
    if (!pc) return;

    switch (msg.type) {
      case "offer": {
        const offerCollision =
          makingOfferRef.current || pc.signalingState !== "stable";
        ignoreOfferRef.current = !isPolite && offerCollision;
        if (ignoreOfferRef.current) return;

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

          for (const c of pendingCandidates.current) {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingCandidates.current = [];

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
          console.error("Offer handling error:", err);
        }
        break;
      }

      case "answer":
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
          for (const c of pendingCandidates.current) {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingCandidates.current = [];
        } catch (err) {
          console.error("Answer handling error:", err);
        }
        break;

      case "candidate":
        try {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
          } else {
            pendingCandidates.current.push(msg.payload);
          }
        } catch (err) {
          console.error("Candidate handling error:", err);
        }
        break;

      case "leave":
        if (remoteVideo.current) remoteVideo.current.srcObject = null;

        break;
    }
  };

  useWebSocket<SignalMessage>(
    `${process.env.NEXT_PUBLIC_GO_API_WS_URL}/signaling?session_id=${sessionId}`,
    {
      onMessage: handleSignalMessage,
      autoReconnect: false,
    }
  );

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
    });
    pcRef.current = pc;

    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendSignal({
          from: userId,
          to: "broadcast",
          type: "offer",
          payload: offer,
          sessionId,
        });
      } catch (err) {
        console.error("Negotiation error:", err);
      } finally {
        makingOfferRef.current = false;
      }
    };

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        try {
          await sendSignal({
            from: userId,
            to: "broadcast",
            type: "candidate",
            payload: event.candidate.toJSON(),
            sessionId,
          });
        } catch (err) {
          console.error("ICE candidate send error:", err);
        }
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideo.current) remoteVideo.current.srcObject = event.streams[0];
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideo.current) localVideo.current.srcObject = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      })
      .catch((err) => console.error("getUserMedia error:", err));

    return () => {
      endCall();
      pc.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      pendingCandidates.current = [];
      makingOfferRef.current = false;
      ignoreOfferRef.current = false;
    };
  }, [sendSignal, userId, sessionId, endCall]);

  useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = cameraOn;
    });
  }, [cameraOn]);

  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = micOn;
    });
  }, [micOn]);

  return {
    localVideo,
    remoteVideo,
    setCameraOn,
    setMicOn,
    cameraOn,
    micOn,
    endCall,
  };
}
