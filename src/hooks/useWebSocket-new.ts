"use client";

import { wsManager } from "@/store/wsStore";
import { useEffect, useRef, useState } from "react";

type ConnectionState = "connecting" | "connected" | "disconnected";

interface UseWebSocketOptions<MsgType extends object> {
  onMessage: (msg: MsgType) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event) => void;
  autoReconnect?: boolean;
  reconnectIntervalInMs?: number;
  maxRetries?: number;
}

/**
 * React wrapper around wsManager (singleton).
 * Now uses Zustand selector subscription for efficiency.
 */
export function useWebSocket<MsgType extends object>(
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

  const onMessageRef = useRef(onMessage);
  const optsRef = useRef({
    onOpen,
    onClose,
    onError,
    autoReconnect,
    reconnectIntervalInMs,
    maxRetries,
  });

  useEffect(() => {
    onMessageRef.current = onMessage;
    optsRef.current = {
      onOpen,
      onClose,
      onError,
      autoReconnect,
      reconnectIntervalInMs,
      maxRetries,
    };
  }, [
    onMessage,
    onOpen,
    onClose,
    onError,
    autoReconnect,
    reconnectIntervalInMs,
    maxRetries,
  ]);

  useEffect(() => {
    const store = wsManager;

    store.getState().connect<MsgType>(url, {
      ...optsRef.current,
      onMessage: (msg) => onMessageRef.current(msg),
    });

    const unsubscribe = store.subscribe(
      (state) => state.getConnectionState(url),
      (newState) => setConnectionState(newState)
    );

    return () => {
      unsubscribe();
      store.getState().disconnect(url);
    };
  }, [url]);

  const ws = wsManager.getState().getSocket(url);

  return { connectionState, ws };
}
