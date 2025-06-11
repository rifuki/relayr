"use client";

// React
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// External Libraries
import useWebSocket from "react-use-websocket";
import {
  WebSocketLike,
  type WebSocketHook,
} from "react-use-websocket/dist/lib/types";

// State Management
import {
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";

// Types
import {
  CancelSenderReadyRequest,
  CancelSenderTransferRequest,
} from "@/types/webSocketMessages";

// WebSocket Handlers
import {
  processWebSocketOnClose,
  processWebSocketTextMessage,
} from "@/websocket/senderHandlers";

/**
 * SenderWebSocketContextType
 * -------------------------
 * Interface for the sender WebSocket context value.
 */
interface SenderWebSocketContextType {
  getWebSocket: () => WebSocketLike | null;
  readyState: WebSocketHook["readyState"];
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
  sendMessage: WebSocketHook["sendMessage"];
  openConnection: (url: string) => void;
  closeConnection: (code: number, reason: string) => void;
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
export function SenderWebSocketProvider({ children }: { children: ReactNode }) {
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const openConnection = (url: string) => setWsUrl(url);

  // Extracting necessary values from the store
  const file = useFileSenderStore((state) => state.file);
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const transferConnection = useFileSenderStore(
    (state) => state.transferConnection,
  );
  const transferStatus = useFileSenderStore((state) => state.transferStatus);
  const transferProgress = useFileSenderStore(
    (state) => state.transferProgress,
  );
  const actions = useFileSenderActions();
  // Extracting necessary values from the store [end]

  // Setup WebSocket connection and handlers
  const {
    getWebSocket,
    lastMessage,
    sendJsonMessage,
    sendMessage,
    readyState,
  } = useWebSocket(wsUrl, {
    share: true,
    shouldReconnect: () => true,
    onError: (error: Event) => {
      console.error("🔥 Error", error);
      actions.setErrorMessage("WebSocket connection error. Please try again.");
    },
    onClose: (close: CloseEvent) =>
      processWebSocketOnClose(close, { actions, setWsUrl }),
  });

  // Close the WebSocket connection
  const closeConnection = useCallback(
    (code = 1000, reason = "Connection closed") => {
      const ws = getWebSocket();
      if (ws && ws.readyState === WebSocket.OPEN) ws.close(code, reason);
    },
    [getWebSocket],
  );

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage || typeof lastMessage.data !== "string") return;
    try {
      const parsed = JSON.parse(lastMessage.data);
      processWebSocketTextMessage(parsed, {
        actions,
        file,
        fileMetadata,
        transferConnection,
        transferStatus,
        transferProgress,
        sendJsonMessage,
        sendMessage,
        closeConnection,
      });
    } catch (error) {
      console.error("❌ Error parsing websocket message:", error);
    }
  }, [
    lastMessage,
    actions,
    file,
    fileMetadata,
    transferConnection,
    transferStatus,
    transferProgress,
    sendJsonMessage,
    sendMessage,
    closeConnection,
  ]);

  // Handle cleanup and notify server on window unload
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function handleBeforeUnload(_e: BeforeUnloadEvent) {
      const canSend =
        readyState === WebSocket.OPEN && transferConnection.recipientId;
      if (!canSend) return;

      if (transferStatus.isTransferring) {
        sendJsonMessage({
          type: "cancelSenderTransfer",
        } satisfies CancelSenderTransferRequest);
      }
      sendJsonMessage({
        type: "cancelSenderReady",
      } satisfies CancelSenderReadyRequest);
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    readyState,
    sendJsonMessage,
    transferStatus.isTransferring,
    transferConnection.recipientId,
  ]);

  return (
    <SenderWebSocketContext.Provider
      value={{
        getWebSocket,
        readyState,
        sendJsonMessage,
        sendMessage,
        openConnection,
        closeConnection,
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
export function useSenderWebSocket() {
  return useContext(SenderWebSocketContext);
}
