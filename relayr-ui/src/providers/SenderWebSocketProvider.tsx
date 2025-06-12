"use client";

// React
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

// External Libraries
import useWebSocket from "react-use-websocket";

// State Management
import { useFileSenderActions } from "@/stores/useFileSenderStore";

// External Librairies Types
import { type WebSocketHook } from "react-use-websocket/dist/lib/types";

/**
 * SenderWebSocketContextType
 * -------------------------
 * Interface for the sender WebSocket context value.
 */
interface SenderWebSocketContextType {
  lastMessage: WebSocketHook["lastMessage"];
  readyState: WebSocketHook["readyState"];
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
  sendMessage: WebSocketHook["sendMessage"];
  openConnection: (url: string) => void;
}

/**
 * SenderWebSocketContext
 * ---------------------
 * React context for the sender WebSocket.
 */
const SenderWebSocketContext = createContext<SenderWebSocketContextType | null>(
  null,
);

/**
 * SenderWebSocketProvider
 * ----------------------
 * Provides WebSocket connection and actions to child components.
 */
export default function SenderWebSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const openConnection = useCallback((url: string) => setWsUrl(url), []);

  // Accessing actions from the file sender store
  const actions = useFileSenderActions();

  // Setting up the WebSocket connection
  const { lastMessage, sendJsonMessage, sendMessage, readyState } =
    useWebSocket(wsUrl, {
      share: true,
      shouldReconnect: () => true,
      onClose: (close: CloseEvent) => {
        console.info("❌ Disconnected", close.code);

        actions.setErrorMessage(null);
        actions.setTransferShareLink(null);
        actions.setTransferConnection({ senderId: null, recipientId: null });
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
        actions.setErrorMessage(
          "WebSocket connection error. Please try again.",
        );
      },
    });

  return (
    <SenderWebSocketContext.Provider
      value={{
        lastMessage,
        readyState,
        sendJsonMessage,
        sendMessage,
        openConnection,
      }}
    >
      {children}
    </SenderWebSocketContext.Provider>
  );
}

/**
 * useSenderWebsocket
 * ------------------
 * Custom hook to access the sender WebSocket context.
 */
export const useSenderWebSocket = () => useContext(SenderWebSocketContext);
