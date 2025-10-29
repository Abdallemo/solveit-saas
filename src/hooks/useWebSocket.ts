"use client";
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

type ConnectionState = "connecting" | "connected" | "disconnected";

export  function useWebSocket<MsgType extends object>(
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
  const isIntentionallyClosing = useRef(false);
  const attempts = useRef(0);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
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

      if (
        autoReconnect &&
        !isIntentionallyClosing.current &&
        attempts.current < maxRetries
      ) {
        const delay = reconnectIntervalInMs * Math.pow(1.5, attempts.current);
        console.log(`Reconnecting in ${delay / 1000}s...`);
        attempts.current++;
        reconnectTimeout.current = setTimeout(connect, delay);
      } else if (isIntentionallyClosing.current) {
        isIntentionallyClosing.current = false;
      } else {
        console.warn(
          "Max reconnect attempts reached or autoReconnect disabled."
        );
      }
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

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close(1000, "Component unmounted");
    };
  }, [connect]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const ws = wsRef.current;

        if (
          !ws ||
          ws.readyState === WebSocket.CLOSED ||
          ws.readyState === WebSocket.OPEN
        ) {
          if (ws && ws.readyState === WebSocket.OPEN) {
            console.log(
              "Forcing close and reconnect on tab focus to clear stale state."
            );
            isIntentionallyClosing.current = true;
            ws.close(1000, "Forced Reconnect on Visibility");
          }
          setTimeout(connect, 500);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [connect]);

  useEffect(() => {
    if (connectionState === "connected") {
      const clientPingInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "CLIENT_PING" }));
        }
      }, 10000);

      return () => clearInterval(clientPingInterval);
    }
  }, [connectionState]);

  return { connectionState, ws: wsRef };
}
