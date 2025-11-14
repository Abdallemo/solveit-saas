export type connType = "camera" | "screen";
export type signalType =
  | "offer"
  | "answer"
  | "candidate"
  | "leave"
  | "stopScreen"
  | "startScreen"
  | "cancelScreen"
  | "syncScreen"
  | "syncCamera"
  | "join";

export type SignalMessage = {
  from: string;
  to: string;
  type:signalType;
  payload: any;
  sessionId: string;
  connectionType: connType;
  states?: { audioStatus: "muted" | "unmuted" };
};
