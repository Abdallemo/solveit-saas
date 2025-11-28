// signaling.ts
import { SocketClient } from "@/lib/ws/SocketClient";
import { SignalMessage } from "./types";

export interface SignalHandler {
  handle(message: SignalMessage): Promise<void>;
}

export class SignalingService {
  private ws: SocketClient<SignalMessage> | null = null;

  constructor(
    private readonly sessionId: string,
    private readonly handler: SignalHandler
  ) {}

  public connect = () => {
    if (typeof window === "undefined") return;

    this.ws = new SocketClient<SignalMessage>(
      `${process.env.NEXT_PUBLIC_GO_API_WS_URL}/signaling?session_id=${this.sessionId}`,
      {
        onMessage: async (msg) => {
          await this.handler.handle(msg);
        },
        onOpen: () => console.log("Signaling WS connected"),
        onClose: () => console.log("Signaling WS disconnected"),
        onError: (err) => console.error("Signaling WS error:", err),
      }
    );

    this.ws.connect();
  };
  public isConnected = () => {
    return this.ws?.getState() === "connected";
  };
  public async send(msg: SignalMessage) {
    try {
      const messageToSend = {
        ...msg,
        connectionType: msg.connectionType || "camera",
      };
      if (this.ws?.getState() === "connected") {
        this.ws?.send(messageToSend);
      }
    } catch (err) {
      console.error("Signal send error:", err);
    }
  }

  public close() {
    this.ws?.close();
    this.ws = null;
  }
}
