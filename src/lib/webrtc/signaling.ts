import { sendSignalMessage } from "@/features/mentore/server/action";
import { SignalMessage } from "./types";

export interface SignalHandler {
  handle(message: SignalMessage): Promise<void>;
}
export class SignalingService {
  private ws: WebSocket | null = null;
  private readonly sessionId: string;
  private readonly handler: SignalHandler;

  constructor(sessionId: string, handler: SignalHandler) {
    this.sessionId = sessionId;
    this.handler = handler;
  }

  public connect() {
    if (typeof window === "undefined") return;
    this.ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_GO_API_WS_URL}/signaling?session_id=${this.sessionId}`
    );
    this.ws.onmessage = (e) => this.handler.handle(JSON.parse(e.data));
  }

  public async send(msg: SignalMessage) {
    try {
      const messageToSend = {
        ...msg,
        connectionType: msg.connectionType || "camera",
      };
      await sendSignalMessage(messageToSend);
    } catch (err) {
      console.error("Signal send error:", err);
    }
  }

  public close() {
    if (this.ws) {
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
  }
}
