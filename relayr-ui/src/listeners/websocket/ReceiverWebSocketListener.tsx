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
import type { UserCloseRequest } from "@/types/webSocketMessages";

export default function ReceiverWebSocketListener() {
  // Accessing the receiver WebSocket context

  // Extracting necessary values from the WebSocket
  const { lastMessage, sendJsonMessage } = useReceiverWebSocket();

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
  });

  useEffect(() => {
    depsRef.current = {
      actions,
      fileMetadata,
      transferConnection,
      fileTransferInfo,
      transferStatus,
      transferProgress,
    };
  }, [
    actions,
    fileMetadata,
    transferConnection,
    fileTransferInfo,
    transferStatus,
    transferProgress,
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
      sendJsonMessage({
        type: "userClose",
        userId: transferConnection.recipientId!,
        role: "receiver",
        reason: "Receiver closed the window/tab.",
      } satisfies UserCloseRequest);
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sendJsonMessage, transferConnection]);

  return null;
}
