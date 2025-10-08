import { getWebRTCManager } from "@/lib/webrtcManagerClassVersion";
import { useEffect, useRef, useState } from "react";

export function useMentorshipCall(userId: string, sessionId: string) {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const localScreenShare = useRef<HTMLVideoElement>(null);
  const remoteScreenShare = useRef<HTMLVideoElement>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
  }>({ cameras: [], microphones: [] });

  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [selectedMic, setSelectedMic] = useState<string | null>(null);

  const manager = getWebRTCManager(userId, sessionId);
  useEffect(() => {
    const unsubscribe = manager.subscribe((state) => {
      if (localVideo.current) {
        localVideo.current.srcObject = state.localStream;
      }
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = state.remoteStream;
      }

      if (localScreenShare.current) {
        localScreenShare.current.srcObject = state.localScreenShare;
      }
      if (remoteScreenShare.current) {
        remoteScreenShare.current.srcObject = state.remoteScreenShare;
      }
      setCameraOn(state.cameraOn);
      setMicOn(state.micOn);
      setIsScreenSharing(state.isScreenSharing);
    });
    const loadDevices = async () => {
      const list = await manager.listDevices();
      setDevices(list);
      if (list.cameras[0]) setSelectedCamera(list.cameras[0].deviceId);
      if (list.microphones[0]) setSelectedMic(list.microphones[0].deviceId);
    };
    loadDevices();
    navigator.mediaDevices.ondevicechange = loadDevices;

    return () => {
      unsubscribe();
      navigator.mediaDevices.ondevicechange = null;
    };
  }, [manager]);

  const handleSwitchCamera = async (deviceId: string) => {
    await manager.switchCamera(deviceId);
    setSelectedCamera(deviceId);
  };

  const handleSwitchMic = async (deviceId: string) => {
    await manager.switchMic(deviceId);
    setSelectedMic(deviceId);
  };

  return {
    localVideo,
    remoteVideo,
    cameraOn,
    micOn,
    isScreenSharing,
    setCameraOn: manager.toggleCamera,
    setMicOn: manager.toggleMic,
    endCall: manager.leaveCall,
    devices,
    selectedCamera,
    selectedMic,
    switchCamera: handleSwitchCamera,
    switchMic: handleSwitchMic,
    setToggleScreenShare: manager.toggleScreenShare,
    localScreenShare,
    remoteScreenShare,
  };
}
