"use client";
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useRef,
  useState,
} from "react";

type MentorshipCallContextType = {
  localVideo: RefObject<HTMLVideoElement | null>;
  remoteVideo: RefObject<HTMLVideoElement | null>;
  localScreenShare: RefObject<HTMLVideoElement | null>;
  remoteScreenShare: RefObject<HTMLVideoElement | null>;

  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  localScreenStream: MediaStream | null;
  remoteScreenStream: MediaStream | null;

  cameraOn: boolean;
  micOn: boolean;

  setState: (state: Partial<MentorshipCallContextType>) => void;
};

const MentorshipCallContext = createContext<MentorshipCallContextType | null>(
  null
);

type ProviderProps = { children: ReactNode };

export const MentorshipCallProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const localScreenShare = useRef<HTMLVideoElement>(null);
  const remoteScreenShare = useRef<HTMLVideoElement>(null);

  const [state, setStateInternal] = useState<
    Omit<MentorshipCallContextType, "setState">
  >({
    localVideo,
    remoteVideo,
    localScreenShare,
    remoteScreenShare,
    localStream: null,
    remoteStream: null,
    localScreenStream: null,
    remoteScreenStream: null,
    cameraOn: true,
    micOn: true,
  });

  const setState = (newState: Partial<MentorshipCallContextType>) => {
    setStateInternal((prev) => ({ ...prev, ...newState }));
  };

  return (
    <MentorshipCallContext.Provider value={{ ...state, setState }}>
      {children}
    </MentorshipCallContext.Provider>
  );
};

export function useMentorshipCallContext() {
  const ctx = useContext(MentorshipCallContext);
  if (!ctx)
    throw new Error(
      "useMentorshipCallContext must be used inside MentorshipCallProvider"
    );
  return ctx;
}
