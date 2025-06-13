"use client";

// React
import { useEffect, useRef } from "react";

// External Libraries
import { useShallow } from "zustand/shallow";

// Context Providers
import { useReceiverWebSocket } from "@/providers/ReceiverWebSocketProvider";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

// Internal Handlers
import {
  processWebSocketBlobMessage,
  processWebSocketTextMessage,
} from "./handlers/receiver";

// Types
import type {
  CancelRecipientReadyRequest,
  CancelRecipientTransferRequest,
} from "@/types/webSocketMessages";

export default function ReceiverWebSocketListener() {
  // Accessing the receiver WebSocket context
  const receiverWebSocket = useReceiverWebSocket();
  if (!receiverWebSocket) throw new Error("ReceiverWebSocket is not available");

  // Extracting necessary values from the WebSocket
  const { lastMessage, readyState, sendJsonMessage } = receiverWebSocket;

  // Extracting necessary values from the store
  const {
    fileMetadata,
    transferConnection,
    fileTransferInfo,
    transferStatus,
    transferProgress,
  } = useFileReceiverStore(
    useShallow((state) => ({
      fileMetadata: state.fileMetadata,
      transferConnection: state.transferConnection,
      fileTransferInfo: state.fileTransferInfo,
      transferStatus: state.transferStatus,
      transferProgress: state.transferProgress,
    })),
  );
  const actions = useFileReceiverActions();

  const depsRef = useRef({
    actions,
    fileMetadata,
    transferConnection,
    fileTransferInfo,
    transferStatus,
    transferProgress,
    readyState,
  });

  useEffect(() => {
    depsRef.current = {
      actions,
      fileMetadata,
      transferConnection,
      fileTransferInfo,
      transferStatus,
      transferProgress,
      readyState,
    };
  }, [
    actions,
    fileMetadata,
    transferConnection,
    fileTransferInfo,
    transferStatus,
    transferProgress,
    readyState,
  ]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    const {
      actions,
      fileMetadata,
      transferConnection,
      fileTransferInfo,
      transferStatus,
      transferProgress,
      readyState,
    } = depsRef.current;

    if (typeof lastMessage.data === "string") {
      try {
        const parsed = JSON.parse(lastMessage.data);
        processWebSocketTextMessage(parsed, {
          actions,
          fileMetadata,
          transferConnection,
          fileTransferInfo,
          transferStatus,
          transferProgress,
          readyState,
          sendJsonMessage,
        });
      } catch (error: unknown) {
        console.error("❌ Error parsing websocket message:", error);
      }
    } else if (lastMessage.data instanceof Blob) {
      processWebSocketBlobMessage(lastMessage.data, {
        actions,
        fileMetadata,
        transferConnection,
        fileTransferInfo,
        transferStatus,
        sendJsonMessage,
      });
    } else {
      console.error(
        "Received message with unsupported data type:",
        lastMessage.data,
      );
    }
  }, [lastMessage, sendJsonMessage]);

  // Handle cleanup and notify server on window unload
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function handleBeforeUnload(_e: BeforeUnloadEvent) {
      const { isConnected, senderId } = transferConnection;
      const { isTransferring } = transferStatus;

      const canSend = readyState === WebSocket.OPEN && senderId && isConnected;
      if (!canSend) return;

      if (isTransferring) {
        sendJsonMessage({
          type: "cancelRecipientTransfer",
          senderId,
        } satisfies CancelRecipientTransferRequest);
      }
      sendJsonMessage({
        type: "cancelRecipientReady",
        senderId,
      } satisfies CancelRecipientReadyRequest);
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [transferConnection, transferStatus, readyState, sendJsonMessage]);

  return null;
}
