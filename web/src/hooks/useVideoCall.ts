import { useWebRTCStore } from "@/store/webRtcStore";
import { useEffect, useRef } from "react";

export function useMentorshipCall(userId: string, sessionId: string) {
  const {
    localStream,
    remoteStream,
    localScreenStream,
    remoteScreenStream,
    initManager,
  } = useWebRTCStore();

  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const localScreenShare = useRef<HTMLVideoElement>(null);
  const remoteScreenShare = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initManager(userId, sessionId);
  }, [userId, sessionId, initManager]);

  useEffect(() => {
    if (!localVideo.current) return;

    if (localStream) {
      localVideo.current.srcObject = localStream;
    } else {
      localVideo.current.srcObject = null;
    }
  }, [localStream]);

  useEffect(() => {
    if (!remoteVideo.current) return;

    if (remoteStream) {
      remoteVideo.current.srcObject = remoteStream;
    } else {
      remoteVideo.current.srcObject = null;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!localScreenShare.current) return;

    if (localScreenStream) {
      localScreenShare.current.srcObject = localScreenStream;
    } else {
      localScreenShare.current.srcObject = null;
    }
  }, [localScreenStream]);

  useEffect(() => {
    if (!remoteScreenShare.current) return;
    remoteScreenShare.current.srcObject = remoteScreenStream ?? null;
  }, [remoteScreenShare, remoteScreenStream]);

  return {
    localVideo,
    remoteVideo,
    localScreenShare,
    remoteScreenShare,
    ...useWebRTCStore(),
  };
}
