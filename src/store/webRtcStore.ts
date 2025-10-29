import { getWebRTCManager, WebRTCManager } from "@/lib/webrtc/webrtcManager";
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

  setCameraOn: () => void;
  setMicOn: () => void;
  setToggleScreenShare: () => void;
  switchCamera: (deviceId: string) => Promise<void>;
  switchMic: (deviceId: string) => Promise<void>;
  startCall: () => Promise<void>;
  endCall: () => Promise<void>;

  manager: ReturnType<typeof getWebRTCManager> | null;
}

interface CallActions {
  initManager: (userId: string, sessionId: string) => WebRTCManager;
  updateState: (state: Partial<PersistentCallState>) => void;
  clearState: () => void;
}

const initialState: PersistentCallState = {
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

  setCameraOn: () => {},
  setMicOn: () => {},
  setToggleScreenShare: () => {},
  switchCamera: async () => {},
  switchMic: async () => {},
  endCall: async () => {},
  startCall: async () => {},

  manager: null,
};

export const useWebRTCStore = create<PersistentCallState & CallActions>(
  (set, get) => ({
    ...initialState,

    initManager: (userId, sessionId) => {
      const manager = getWebRTCManager(userId, sessionId);

      manager.preloadPeers();

      manager.subscribe((state) => {
        set({
          localStream: state.localStream,
          remoteStream: state.remoteStream,
          localScreenStream: state.localScreenShare,
          remoteScreenStream: state.remoteScreenShare,
          cameraOn: state.cameraOn,
          micOn: state.micOn,
          isScreenSharing: state.isScreenSharing,
        });
      });

      manager.listDevices().then((devices) => {
        set({
          devices,
          selectedCamera: devices.cameras[0]?.deviceId || null,
          selectedMic: devices.microphones[0]?.deviceId || null,
        });
      });

      navigator.mediaDevices.ondevicechange = async () => {
        const list = await manager.listDevices();
        set({
          devices: list,
          selectedCamera: list.cameras[0]?.deviceId || null,
          selectedMic: list.microphones[0]?.deviceId || null,
        });
      };

      set({
        manager,
        setCameraOn: () => {
          const { cameraOn } = get();
          manager.toggleCamera(!cameraOn);
          set({ cameraOn: !cameraOn });
        },
        setMicOn: () => {
          const { micOn } = get();
          manager.toggleMic(!micOn);
          set({ micOn: !micOn });
        },
        setToggleScreenShare: () => {
          const { isScreenSharing } = get();
          manager.toggleScreenShare(!isScreenSharing);
          set((prev) => ({ isScreenSharing: !prev.isScreenSharing }));
        },
        switchCamera: async (deviceId: string) => {
          await manager.switchCamera(deviceId);
          set({ selectedCamera: deviceId });
        },
        switchMic: async (deviceId: string) => {
          await manager.switchMic(deviceId);
          set({ selectedMic: deviceId });
        },
        startCall: manager.startCall,
        endCall: manager.leaveCall,
      });
      return manager;
    },

    updateState: (state) => set((s) => ({ ...s, ...state })),
    clearState: () => {
      set(initialState);
    },
  })
);
