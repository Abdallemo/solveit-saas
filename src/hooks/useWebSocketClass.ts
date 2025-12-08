import { ConnectionState, SocketClient } from "@/lib/ws/SocketClient";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebSocketOptions<MsgType extends object> {
  onMessage: (msg: MsgType) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
  autoReconnect?: boolean;
  reconnectIntervalInMs?: number;
  maxRetries?: number;
}

export function useWebSocket<MsgType extends object>(
  url: string,
  options: UseWebSocketOptions<MsgType>,
) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const wsRef = useRef<SocketClient<MsgType> | null>(null);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const proxyOptions = {
      onMessage: (msg: MsgType) => optionsRef.current.onMessage(msg),
      onOpen: () => optionsRef.current.onOpen?.(),
      onClose: () => optionsRef.current.onClose?.(),
      onError: (err: Event) => optionsRef.current.onError?.(err),

      autoReconnect: optionsRef.current.autoReconnect,
      reconnectIntervalInMs: optionsRef.current.reconnectIntervalInMs,
      maxRetries: optionsRef.current.maxRetries,

      onStateChange: setConnectionState,
    };

    const ws = new SocketClient<MsgType>(url, proxyOptions);
    wsRef.current = ws;
    ws.connect();

    return () => {
      ws.close();
    };
  }, [url]);

  const send = useCallback((data: MsgType) => {
    if (wsRef.current?.getState() === "connected") {
      wsRef.current.send(data);
    } else {
      console.warn("WebSocket not connected. Message dropped.");
    }
  }, []);

  return { connectionState, ws: wsRef, send };
}
