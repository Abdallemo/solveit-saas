export type connType = "camera" | "screen";
export type SignalMessage = {
  from: string;
  to: string;
  type:
    | "offer"
    | "answer"
    | "candidate"
    | "leave"
    | "stopScreen"
    | "startScreen"
    | "cancelScreen";
  payload: any;
  sessionId: string;
  connectionType?: connType;
};
