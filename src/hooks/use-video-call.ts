import { getWebRTCManager } from "@/lib/webrtc/webrtcManager";
import { useMentorshipCallStore } from "@/store/CallStore";
import { useEffect, useRef, useState } from "react";

export function useMentorshipCall(userId: string, sessionId: string) {
  const { setPersistentState, clearPersistentState } = useMentorshipCallStore();
  const {
    localStream,
    remoteStream,
    localScreenStream,
    remoteScreenStream,
    isScreenSharing,
    cameraOn,
    devices,
    endCall,

    micOn,

    selectedCamera,
    selectedMic,
    setCameraOn,
    setMicOn,
    setToggleScreenShare,
    switchCamera,
    switchMic,
  } = useWebRTCManagerClient(userId, sessionId as string);
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const localScreenShare = useRef<HTMLVideoElement>(null);
  const remoteScreenShare = useRef<HTMLVideoElement>(null);
  // console.log("Local camera share:", localVideo.current?.srcObject);
  // console.log("Local screen share:", localScreenShare.current?.srcObject);
  useEffect(() => {
    if (localVideo.current && localStream) {
      localVideo.current.srcObject = localStream;
      console.log("remote al camera share:", localVideo.current?.srcObject);
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideo.current && remoteStream) {
      remoteVideo.current.srcObject = remoteStream;
      console.log("remote screen share:", remoteVideo.current?.srcObject);
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localScreenShare.current && localScreenStream) {
      localScreenShare.current.srcObject = localScreenStream;
    }
  }, [localScreenStream]);

  useEffect(() => {
    if (remoteScreenShare.current && remoteScreenStream) {
      remoteScreenShare.current.srcObject = remoteScreenStream;
    }
  }, [remoteScreenStream]);
  useEffect(() => {
    if (localStream) {
      setPersistentState({
        localStream,
        remoteStream,
        localScreenStream,
        remoteScreenStream,
        isScreenSharing,
        cameraOn,
        micOn,
        devices,
        selectedCamera,
        selectedMic,
      });
    }
    if (!localStream) {
      clearPersistentState();
    }
  }, [
    localStream,
    remoteStream,
    localScreenStream,
    remoteScreenStream,
    isScreenSharing,
    cameraOn,
    micOn,
    devices,
    selectedCamera,
    selectedMic,
    setPersistentState,
    clearPersistentState, // Include Zustand setters
  ]);

  return {
    localVideo,
    remoteVideo,
    cameraOn,
    micOn,
    isScreenSharing,
    setCameraOn,
    setMicOn,
    endCall,
    devices,
    selectedCamera,
    selectedMic,
    switchCamera,
    switchMic,
    setToggleScreenShare,
    localScreenShare,
    remoteScreenShare,
    localStream,
    remoteStream,
    localScreenStream,
    remoteScreenStream,
  };
}
export function useWebRTCManagerClient(userId: string, sessionId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] =
    useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] =
    useState<MediaStream | null>(null);

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
      setLocalStream(state.localStream);
      setRemoteStream(state.remoteStream);
      setLocalScreenStream(state.localScreenShare);
      setRemoteScreenStream(state.remoteScreenShare);
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
    localStream,
    remoteStream,
    localScreenStream,
    remoteScreenStream,
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
  };
}
