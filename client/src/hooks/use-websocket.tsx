import { useState, useEffect, useCallback, useRef } from "react";

type WebSocketStatus = "connecting" | "open" | "closed" | "error";

interface UseWebSocketProps {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export function useWebSocket({
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnectInterval = 5000,
  reconnectAttempts = 5,
}: UseWebSocketProps = {}) {
  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const [lastMessage, setLastMessage] = useState<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectCountRef = useRef(0);

  // Create WebSocket connection
  const connect = useCallback(() => {
    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      setStatus("connecting");
      
      // Create WebSocket URL with the correct protocol (ws or wss) based on the current protocol (http or https)
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        setStatus("open");
        reconnectCountRef.current = 0;
        if (onOpen) onOpen();
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          if (onMessage) onMessage(data);
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };
      
      socket.onclose = () => {
        setStatus("closed");
        if (onClose) onClose();
        
        // Attempt to reconnect if not exceeded max attempts
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current += 1;
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts})...`);
            connect();
          }, reconnectInterval);
        }
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setStatus("error");
        if (onError) onError(error);
        socket.close();
      };
      
      socketRef.current = socket;
    } catch (err) {
      console.error("Failed to connect to WebSocket:", err);
      setStatus("error");
    }
  }, [onMessage, onOpen, onClose, onError, reconnectInterval, reconnectAttempts]);

  // Send message through WebSocket
  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  // Connect on component mount and disconnect on unmount
  useEffect(() => {
    connect();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    status,
    lastMessage,
    sendMessage,
    connect,
  };
}