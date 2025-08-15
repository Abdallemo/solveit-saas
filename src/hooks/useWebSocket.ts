"use client";
import { useEffect, useRef, useState } from "react";

interface UseWebSocketOptions<MsgType extends object> {
  onMessage: (msg: MsgType) => void;
  autoReconnect?: boolean;
}
type ConnectionState = "connecting" | "connected" | "disconnected";

export default function useWebSocket<MsgType extends object>(
  url: string,
  { onMessage, autoReconnect = true }: UseWebSocketOptions<MsgType>
) {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const attempts = useRef(0);
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
  onMessageRef.current = onMessage;
}, [onMessage]);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState("connected");
        attempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const msg: MsgType = JSON.parse(event.data);
          onMessageRef.current(msg);
        } catch (error) {
          console.log("Invalid WS message:", event.data, error);
        }
      };

      ws.onerror = (event) => {
        setConnectionState("disconnected");
        console.log("WS error:", event);
      };

      ws.onclose = () => {
        setConnectionState("disconnected");
      };
    }

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
    };
  }, [url]);

  return { connectionState };
}
