import { sendSignalMessage } from "@/features/mentore/server/action";
import { wsManager } from "@/store/wsStore";
import { SignalMessage } from "./types";

export interface SignalHandler {
  handle(message: SignalMessage): Promise<void>;
}

export class SignalingService {
  private readonly sessionId: string;
  private readonly handler: SignalHandler;
  private wsUrl: string;

  constructor(sessionId: string, handler: SignalHandler) {
    this.sessionId = sessionId;
    this.handler = handler;
    this.wsUrl = `${process.env.NEXT_PUBLIC_GO_API_WS_URL}/signaling?session_id=${this.sessionId}`;
  }

  public connect() {
    if (typeof window === "undefined") return;

    wsManager.getState().connect<SignalMessage>(this.wsUrl, {
      onMessage: (msg) => this.handler.handle(msg),
      onOpen: () => console.log(`[Signaling] Connected for ${this.sessionId}`),
      onClose: () => console.log(`[Signaling] Closed for ${this.sessionId}`),
      onError: (err) => console.error(`[Signaling] Error:`, err),
      autoReconnect: true,
      reconnectIntervalInMs: 2000,
      maxRetries: 5,
    });
  }

  public async send(msg: SignalMessage) {
    try {
      const messageToSend = {
        ...msg,
        connectionType: msg.connectionType || "camera",
      };
      await sendSignalMessage(messageToSend);
    } catch (err) {
      console.error("[Signaling] Send error:", err);
    }
  }

  public close() {
    const state = wsManager.getState();
    state.disconnect(this.wsUrl);
  }

  public getSocket(): WebSocket | null {
    return wsManager.getState().getSocket(this.wsUrl);
  }

  public getConnectionState() {
    return wsManager.getState().getConnectionState(this.wsUrl);
  }
}
