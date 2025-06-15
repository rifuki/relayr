"use client";

// React
import { useEffect, useRef } from "react";

// External Libraries
import { useShallow } from "zustand/shallow";

// Context Providers
import { useSenderWebSocket } from "@/providers/SenderWebSocketProvider";

// State Management (Store)
import {
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";

// Internal Handlers
import { processWebSocketTextMessage } from "./handlers/sender";

// Types
import type { UserCloseRequest } from "@/types/webSocketMessages";

export default function SenderWebSocketListener() {
  // Accessing the sender WebSocket context
  const { lastMessage, sendMessage, sendJsonMessage } = useSenderWebSocket();

  // Extracting necessary values from the store
  const {
    file,
    fileMetadata,
    transferConnection,
    transferStatus,
    transferProgress,
  } = useFileSenderStore(
    useShallow((state) => ({
      file: state.file,
      fileMetadata: state.fileMetadata,
      transferConnection: state.transferConnection,
      transferStatus: state.transferStatus,
      transferProgress: state.transferProgress,
      actions: state.actions,
    })),
  );
  const actions = useFileSenderActions();

  const depsRef = useRef({
    actions,
    file,
    fileMetadata,
    transferConnection,
    transferStatus,
    transferProgress,
  });

  useEffect(() => {
    depsRef.current = {
      actions,
      file,
      fileMetadata,
      transferConnection,
      transferStatus,
      transferProgress,
    };
  }, [
    actions,
    file,
    fileMetadata,
    transferConnection,
    transferStatus,
    transferProgress,
  ]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage || typeof lastMessage.data !== "string") return;

    const {
      actions,
      file,
      fileMetadata,
      transferConnection,
      transferStatus,
      transferProgress,
    } = depsRef.current;

    try {
      const parsedMessage = JSON.parse(lastMessage.data);
      processWebSocketTextMessage(parsedMessage, {
        actions,
        file,
        fileMetadata,
        transferConnection,
        transferStatus,
        transferProgress,
        sendJsonMessage,
        sendMessage,
      });
    } catch (error) {
      console.error("❌ Error parsing websocket message:", error);
    }
  }, [lastMessage, sendJsonMessage, sendMessage]);

  // Handle cleanup and notify server on window unload
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function handleBeforeUnload(_e: BeforeUnloadEvent) {
      sendJsonMessage({
        type: "userClose",
        userId: transferConnection.senderId!,
        role: "sender",
        reason: "Sender closed the window/tab.",
      } satisfies UserCloseRequest);
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sendJsonMessage, transferConnection]);

  return null;
}
