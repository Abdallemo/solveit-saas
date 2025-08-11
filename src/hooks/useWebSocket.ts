"use client"
import { useEffect, useRef, useState } from "react";
type Message = {
  id: string;
  createdAt: Date | null;
  content: string;
  senderId: string;
  receiverId: string;
  subject: string | null;
  method: "SYSTEM" | "EMAIL";
  read: boolean;
};
export default function useWebSocket(url: string, onMessage: (msg: Message) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const attempts = useRef(0);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        attempts.current = 0;
      };

      ws.onmessage = (event) => {
        const msg: Message = JSON.parse(event.data);
        onMessage(msg);
      };

      ws.onerror = (event) => {
        setIsConnected(false);
        console.error("WS error:", event);
      };

      ws.onclose = () => {
        setIsConnected(false);
        const timeout = Math.min(10000, 1000 * 2 ** attempts.current);
        attempts.current++;
        reconnectTimeout.current = setTimeout(connect, timeout);
      };
    }

    connect();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [url, onMessage]);

  return isConnected;
}
