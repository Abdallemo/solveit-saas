import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

type ConnectionState = "connecting" | "connected" | "disconnected";
const MaxPingIns = 10000;
export interface WebSocketOptions<MsgType extends object> {
  onMessage: (msg: MsgType) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
  autoReconnect?: boolean;
  reconnectIntervalInMs?: number;
  maxRetries?: number;
}

interface WebSocketConnection<MsgType extends object> {
  url: string;
  socket: WebSocket | null;
  connectionState: ConnectionState;
  onMessageRef: (msg: MsgType) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
  autoReconnect: boolean;
  reconnectIntervalInMs: number;
  maxRetries: number;
  reconnectTimeout: NodeJS.Timeout | null;
  isIntentionallyClosing: boolean;
  attempts: number;
  pingInterval: NodeJS.Timeout | null;
  visibilityHandler?: () => void;
}

interface WebSocketStore {
  connections: Map<string, WebSocketConnection<any>>;
  connect: <MsgType extends object>(
    url: string,
    options: WebSocketOptions<MsgType>
  ) => void;
  disconnect: (url: string) => void;
  getSocket: (url: string) => WebSocket | null;
  getConnectionState: (url: string) => ConnectionState;
}

const reconnectDelay = (attempt: number, base = 2000) =>
  base * Math.pow(1.5, attempt);

export const wsManager = createStore(
  subscribeWithSelector<WebSocketStore>((set, get) => ({
    connections: new Map(),

    connect: <MsgType extends object>(
      url: string,
      {
        onMessage,
        onOpen,
        onClose,
        onError,
        autoReconnect = true,
        reconnectIntervalInMs = 2000,
        maxRetries = 10,
      }: WebSocketOptions<MsgType>
    ) => {
      const connections = get().connections;
      const existing = connections.get(url) as
        | WebSocketConnection<MsgType>
        | undefined;

      if (existing?.socket && existing.socket.readyState === WebSocket.OPEN) {
        return;
      }

      const conn: WebSocketConnection<MsgType> =
        existing ??
        ({
          url,
          socket: null,
          connectionState: "connecting",
          onMessageRef: onMessage,
          onOpen,
          onClose,
          onError,
          autoReconnect,
          reconnectIntervalInMs,
          maxRetries,
          reconnectTimeout: null,
          isIntentionallyClosing: false,
          attempts: 0,
          pingInterval: null,
        } as WebSocketConnection<MsgType>);

      conn.onMessageRef = onMessage;

      const connectSocket = () => {
        const ws = new WebSocket(url);
        conn.socket = ws;
        conn.connectionState = "connecting";
        connections.set(url, conn);
        set({ connections });

        ws.onopen = () => {
          conn.connectionState = "connected";
          conn.attempts = 0;
          set({ connections });
          onOpen?.();

          if (conn.pingInterval) {
            clearInterval(conn.pingInterval);
          }
          conn.pingInterval = setInterval(() => {
            if (conn.socket?.readyState === WebSocket.OPEN) {
              conn.socket.send(JSON.stringify({ type: "CLIENT_PING" }));
            }
          }, MaxPingIns);
        };

        ws.onmessage = (event) => {
          try {
            const msg: MsgType = JSON.parse(event.data);
            conn.onMessageRef(msg);
          } catch (error) {
            console.error("[WS] Invalid message:", event.data, error);
          }
        };

        ws.onerror = (event) => {
          conn.connectionState = "disconnected";
          set({ connections });
          onError?.(event);
        };

        ws.onclose = () => {
          conn.connectionState = "disconnected";
          set({ connections });
          onClose?.();

          if (
            conn.autoReconnect &&
            !conn.isIntentionallyClosing &&
            conn.attempts < conn.maxRetries
          ) {
            const delay = reconnectDelay(
              conn.attempts,
              conn.reconnectIntervalInMs
            );
            console.log(`[WS] Reconnecting in ${delay / 1000}s...`);
            conn.attempts++;
            conn.reconnectTimeout = setTimeout(connectSocket, delay);
          } else if (conn.isIntentionallyClosing) {
            conn.isIntentionallyClosing = false;
          } else {
            console.warn(
              "[WS] Max reconnect attempts reached or autoReconnect disabled."
            );
          }
        };
      };

      // const handleVisibility = () => {
      //   if (document.visibilityState === "visible") {
      //     const ws = conn.socket;
      //     if (
      //       !ws ||
      //       ws.readyState === WebSocket.CLOSED ||
      //       ws.readyState === WebSocket.OPEN
      //     ) {
      //       if (ws && ws.readyState === WebSocket.OPEN) {
      //         console.log("[WS] Forcing close and reconnect on tab focus.");
      //         conn.isIntentionallyClosing = true;
      //         ws.close(1000, "Forced Reconnect on Visibility");
      //       }
      //       setTimeout(connectSocket, 500);
      //     }
      //   }
      // };
      let lastReconnect = 0;
      const handleVisibility = () => {
        if (document.visibilityState === "visible") {
          const now = Date.now();
          if (now - lastReconnect < 2000) return; // prevent spam reconnects
          lastReconnect = now;

          const ws = conn.socket;
          if (!ws || ws.readyState === WebSocket.CLOSED) {
            console.log(
              "[WS] Reconnecting because socket was closed while hidden."
            );
            setTimeout(connectSocket, 1500);
          }
        }
      };

      document.addEventListener("visibilitychange", handleVisibility);
      conn.visibilityHandler = handleVisibility;

      connectSocket();
    },

    disconnect: (url) => {
      const conn = get().connections.get(url);
      if (!conn) return;

      conn.isIntentionallyClosing = true;
      if (conn.reconnectTimeout) {
        clearTimeout(conn.reconnectTimeout);
      }
      if (conn.pingInterval) {
        clearInterval(conn.pingInterval);
      }
      conn.socket?.close(1000, "Manual disconnect");
      conn.connectionState = "disconnected";

      if (conn.visibilityHandler) {
        document.removeEventListener(
          "visibilitychange",
          conn.visibilityHandler
        );
      }

      const newMap = new Map(get().connections);
      newMap.delete(url);
      set({ connections: newMap });
    },

    getSocket: (url) => get().connections.get(url)?.socket ?? null,
    getConnectionState: (url) =>
      get().connections.get(url)?.connectionState ?? "disconnected",
  }))
);
