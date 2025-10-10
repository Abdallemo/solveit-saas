// callStore.ts
import { create } from "zustand";

export interface PersistentCallState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  localScreenStream: MediaStream | null;
  remoteScreenStream: MediaStream | null;

  cameraOn: boolean;
  micOn: boolean;
  isScreenSharing: boolean;

  devices: { cameras: MediaDeviceInfo[]; microphones: MediaDeviceInfo[] };
  selectedCamera: string | null;
  selectedMic: string | null;
}

interface CallActions {
  setPersistentState: (state: Partial<PersistentCallState>) => void;

  clearPersistentState: () => void;
}

const initialCallState: PersistentCallState = {
  localStream: null,
  remoteStream: null,
  localScreenStream: null,
  remoteScreenStream: null,
  cameraOn: true,
  micOn: true,
  isScreenSharing: false,
  devices: { cameras: [], microphones: [] },
  selectedCamera: null,
  selectedMic: null,
};

export const useMentorshipCallStore = create<PersistentCallState & CallActions>(
  (set) => ({
    ...initialCallState,

    setPersistentState: (newState) =>
      set((state) => ({
        ...state,
        ...newState,
      })),

    clearPersistentState: () => set(initialCallState),
  })
);
