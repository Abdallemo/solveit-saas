"use client";
import { useEffect, useRef, useState } from "react";

interface UseWebSocketOptions<MsgType extends object> {
  onMessage: (msg: MsgType) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
  autoReconnect?: boolean;
  /** base ms for backoff (default: 2000)*/
  reconnectIntervalInMs?: number;
  /**max reconnect attempts (default: 5)*/
  maxRetries?: number;
}

type ConnectionState = "connecting" | "connected" | "disconnected";

export default function useWebSocket<MsgType extends object>(
  url: string,
  {
    onMessage,
    onOpen,
    onClose,
    onError,
    autoReconnect = true,
    reconnectIntervalInMs = 2000,
    maxRetries = 10,
  }: UseWebSocketOptions<MsgType>
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
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setConnectionState("connecting");

      ws.onopen = () => {
        setConnectionState("connected");
        attempts.current = 0;
        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const msg: MsgType = JSON.parse(event.data);
          onMessageRef.current(msg);
        } catch (error) {
          console.error("Invalid WS message:", event.data, error);
        }
      };

      ws.onerror = (event) => {
        setConnectionState("disconnected");
        onError?.(event);
      };

      ws.onclose = () => {
        setConnectionState("disconnected");
        onClose?.();

        if (autoReconnect && attempts.current < maxRetries) {
          const delay = reconnectIntervalInMs * Math.pow(2, attempts.current);
          console.log(`Reconnecting in ${delay / 1000}s...`);
          attempts.current++;
          reconnectTimeout.current = setTimeout(connect, delay);
        } else {
          console.warn(
            "Max reconnect attempts reached or autoReconnect disabled."
          );
        }
      };
    };

    connect();

    return () => {
      stopped = true;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [
    url,
    autoReconnect,
    reconnectIntervalInMs,
    maxRetries,
    onOpen,
    onClose,
    onError,
  ]);

  return { connectionState, ws: wsRef };
}
