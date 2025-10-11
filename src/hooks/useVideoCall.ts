import { useWebRTCStore } from "@/store/webRtcStore";
import { useEffect, useRef } from "react";

export function useMentorshipCall(userId: string, sessionId: string) {
  const {
    initManager,
    localStream,
    remoteStream,
    localScreenStream,
    remoteScreenStream,

  } = useWebRTCStore();

  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const localScreenShare = useRef<HTMLVideoElement>(null);
  const remoteScreenShare = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    initManager(userId, sessionId);
  }, [userId, sessionId, initManager]);

  useEffect(() => {
    if (localVideo.current && localStream)
      localVideo.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideo.current && remoteStream)
      remoteVideo.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (localScreenShare.current && localScreenStream)
      localScreenShare.current.srcObject = localScreenStream;
  }, [localScreenStream]);

  useEffect(() => {
    if (remoteScreenShare.current && remoteScreenStream)
      remoteScreenShare.current.srcObject = remoteScreenStream;
  }, [remoteScreenStream]);

  return {
    localVideo,
    remoteVideo,
    localScreenShare,
    remoteScreenShare,
    ...useWebRTCStore()
  };
}
