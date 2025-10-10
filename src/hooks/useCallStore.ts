import { useMentorshipCallStore } from "@/store/CallStore";
import { useEffect, useRef } from "react";

export function useCallStore() {
  const {
    localStream,
    remoteStream,
    localScreenStream,
    remoteScreenStream,
    cameraOn,
    micOn,
  } = useMentorshipCallStore();

  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);

  const isCallActive = !!remoteStream;

  useEffect(() => {
    if (localVideo.current && localStream) {
      localVideo.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideo.current && remoteStream) {
      remoteVideo.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return {
    isCallActive,
    localVideo,
    remoteVideo,
    localStream,
    remoteStream,
    cameraOn,
    micOn,
  };
}
