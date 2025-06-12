"use client";

import { useFileReceiverActions } from "@/stores/useFileReceiverStore";
import { createContext, ReactNode, useContext, useState } from "react";
import useWebSocket from "react-use-websocket";
import { WebSocketHook } from "react-use-websocket/dist/lib/types";

interface ReceiverWebSocketContextType {
  lastMessage: WebSocketHook["lastMessage"];
  readyState: WebSocketHook["readyState"];
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
  openConnection: (url: string) => void;
}

const ReceiverWebSocketContext =
  createContext<ReceiverWebSocketContextType | null>(null);

export default function ReceiverWebSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const openConnection = (url: string) => setWsUrl(url);

  const actions = useFileReceiverActions();

  const { lastMessage, sendJsonMessage, readyState } = useWebSocket(wsUrl, {
    share: true,
    onClose: (close: CloseEvent) => {
      console.info("❌ Disconnected", close.code);

      actions.setErrorMessage(null);
      actions.setTransferConnection({ isConnected: false, recipientId: null });
      setWsUrl(null);

      if (close.code === 1000) return;
      else if (close.code === 1006) {
        actions.setErrorMessage("Lost connection to the server");
      } else {
        actions.setErrorMessage(`Disconnected: Code ${close.code}`);
      }
    },
    onError: (error: Event) => {
      console.error("🔥 Error", error);
      actions.setErrorMessage("WebSocket error occurred");
    },
  });

  return (
    <ReceiverWebSocketContext.Provider
      value={{
        lastMessage,
        readyState,
        sendJsonMessage,
        openConnection,
      }}
    >
      {children}
    </ReceiverWebSocketContext.Provider>
  );
}

export const useReceiverWebSocket = () => useContext(ReceiverWebSocketContext);
