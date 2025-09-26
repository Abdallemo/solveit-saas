"use client";
import {
  createContext,
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
type CallContextType = {
  localVideo: RefObject<HTMLVideoElement | null>;
  remoteVideo: RefObject<HTMLVideoElement | null>;
  setCameraOn: Dispatch<SetStateAction<boolean>>;
  cameraOn: boolean;
  setMicOn: Dispatch<SetStateAction<boolean>>;
  micOn: boolean;
};

const CallContext = createContext<CallContextType | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  return (
    <CallContext.Provider
      value={{
        localVideo,
        remoteVideo,
        cameraOn,
        setCameraOn,
        micOn,
        setMicOn,
      }}>
      {children}
    </CallContext.Provider>
  );
}

export function useWebRTCCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCallContext must be used inside CallProvider");
  return ctx;
}
