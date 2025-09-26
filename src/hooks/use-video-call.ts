
import { getWebRTCManager } from "@/lib/webrtcManager";
import { useEffect, useRef, useState } from "react";

export function useMentorshipCall(userId: string, sessionId: string) {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  useEffect(() => {
    const manager = getWebRTCManager(userId, sessionId);

    const unsubscribe = manager.subscribe((state) => {
      if (localVideo.current) localVideo.current.srcObject = state.localStream;
      if (remoteVideo.current)
        remoteVideo.current.srcObject = state.remoteStream;
      setCameraOn(state.cameraOn);
      setMicOn(state.micOn);
    });

    return () => {
      unsubscribe();
    };
  }, [userId, sessionId]);

  const manager = getWebRTCManager(userId, sessionId);

  return {
    localVideo,
    remoteVideo,
    cameraOn,
    micOn,
    setCameraOn: manager.toggleCamera,
    setMicOn: manager.toggleMic,
    endCall: manager.leaveCall,
  };
}
