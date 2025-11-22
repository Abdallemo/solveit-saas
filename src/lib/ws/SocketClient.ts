export type ConnectionState = "connecting" | "connected" | "disconnected";

export interface SocketClientOptions<MsgType extends object> {
  onMessage: (msg: MsgType) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
  autoReconnect?: boolean;
  reconnectIntervalInMs?: number;
  maxRetries?: number;
  onStateChange?: (state: ConnectionState) => void;
}

export class SocketClient<MsgType extends object> {
  private ws: WebSocket | null = null;
  private connectionState: ConnectionState = "connecting";
  private attempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isIntentionallyClosing = false;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(
    private url: string,
    private options: SocketClientOptions<MsgType>
  ) {}

  public getState = () => {
    return this.connectionState;
  };

  private setState = (state: ConnectionState) => {
    this.connectionState = state;
    this.options.onStateChange?.(state);
  };

  public connect = () => {
    if (typeof window === "undefined") return;

    this.cleanup();

    const ws = new WebSocket(this.url);
    this.ws = ws;
    this.setState("connecting");

    ws.onopen = () => {
      this.setState("connected");
      this.attempts = 0;
      this.options.onOpen?.();
      this.startPing();
    };

    ws.onmessage = (event) => {
      try {
        const msg: MsgType = JSON.parse(event.data);
        this.options.onMessage(msg);
      } catch (error) {
        console.error("Invalid WS message:", event.data, error);
      }
    };

    ws.onerror = (event) => {
      this.setState("disconnected");
      this.options.onError?.(event);
    };

    ws.onclose = () => {
      this.setState("disconnected");
      this.options.onClose?.();
      this.stopPing();

      if (
        this.options.autoReconnect !== false &&
        !this.isIntentionallyClosing &&
        this.attempts < (this.options.maxRetries ?? 10)
      ) {
        const delay =
          (this.options.reconnectIntervalInMs ?? 2000) *
          Math.pow(1.5, this.attempts);
        console.log(`Reconnecting in ${delay / 1000}s...`);
        this.attempts++;
        this.reconnectTimeout = setTimeout(() => this.connect(), delay);
      } else if (this.isIntentionallyClosing) {
        this.isIntentionallyClosing = false;
      } else {
        console.warn(
          "Max reconnect attempts reached or autoReconnect disabled."
        );
      }
    };

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  };

  public close = () => {
    this.isIntentionallyClosing = true;
    this.cleanup();
    this.ws?.close(1000, "Manual close");
    this.ws = null;
  };
  public send = (data: MsgType) => {
    try {
      this.ws?.send(JSON.stringify({ payload: data, type: "MESSAGE" }));
    } catch (error) {
      console.log("error sending Data");
    }
  };

  private startPing = () => {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "PING" }));
      }
    }, 10000);
  };

  private stopPing = () => {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = null;
  };

  private handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      if (this.ws?.readyState === WebSocket.CLOSED) {
        console.log(
          "WS was closed on tab blur, attempting reconnect on focus."
        );

        setTimeout(() => this.connect(), 500);
      } else if (this.ws?.readyState !== WebSocket.OPEN) {
        console.log(
          `WS still in state: ${this.connectionState}. No action taken.`
        );
      }
    }
  };

  private cleanup = () => {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.stopPing();
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );
  };
}
