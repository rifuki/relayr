// React
import { useEffect } from "react";

// External Libraries
import useWebSocket, { ReadyState } from "react-use-websocket";

// State Management (Store)
import {
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";

// WebSocket Message Types
import {
  FileTransferAckResponse,
  CancelRecipientReadyResponse,
  CancelSenderReadyRequest,
  FileMetaRequest,
  RecipientReadyResponse,
  RegisterResponse,
  WebSocketSenderTextMessageResponse,
  SenderAckRequest,
  CancelRecipientTransferResponse,
  CancelSenderTransferRequest,
} from "@/types/webSocketMessages";

/**
 * Custom hook to manage the WebSocket connection for file sending.
 * It handles sending file metadata, managing transfer status, and processing incoming messages.
 *
 * @return {Object} - Contains the WebSocket ready state.
 */
export function useFileSenderSocket(): { readyState: ReadyState } {
  // Extracting necessary values from the store
  const file = useFileSenderStore((state) => state.file);
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const webSocketUrl = useFileSenderStore((state) => state.webSocketUrl);
  const { recipientId, senderId } = useFileSenderStore(
    (state) => state.transferConnection,
  );
  const { offset, chunkIndex, chunkDataSize, isTransferring } =
    useFileSenderStore((state) => state.transferStatus);
  const { sender: senderProgress } = useFileSenderStore(
    (state) => state.transferProgress,
  );
  const actions = useFileSenderActions();

  // Setting up WebSocket connection
  const { readyState, sendJsonMessage, sendMessage, getWebSocket } =
    useWebSocket(webSocketUrl, {
      onMessage: (wsMsg: MessageEvent<string>) => {
        try {
          const parsedMessage = JSON.parse(wsMsg.data);
          processWebSocketTextMessage(parsedMessage);
        } catch (error: unknown) {
          console.error("❌ Error parsing websocket message:", error);
        }
      },
      onClose: (close: CloseEvent) => processWebSocketOnClose(close),
      onError: (error: Event) => {
        console.error("🔥 Error", error);
        actions.setErrorMessage("WebSocket error occurred");
      },
    });

  // Handle incoming text WebSocket messages
  const processWebSocketTextMessage = (
    wsMsg: WebSocketSenderTextMessageResponse,
  ) => {
    if (!wsMsg.success) {
      if (wsMsg.message.includes("is no longer connected")) {
        actions.setErrorMessage(
          "Recipient is no longer connection. Please try again.",
        );
        actions.setTransferConnection({ recipientId: null });
        actions.clearTransferState();
      } else {
        actions.setErrorMessage(wsMsg.message ?? "Unknown error occurred");
      }
      return;
    }

    // Process specific WebSocket message types
    switch (wsMsg.type) {
      case "register":
        processRegisterMessage(wsMsg);
        break;
      case "recipientReady":
        processRecipientReadyMessage(wsMsg);
        break;
      case "cancelRecipientReady":
        processCancelRecipientReadyMessage(wsMsg);
        break;
      case "fileTransferAck":
        processFileTransferAcknowledgmentMessage(wsMsg);
        break;
      case "cancelRecipientTransfer":
        processCancelRecipientTransferMessage(wsMsg);
        break;
      default:
        console.error("[WebSocket] Unknown message type received:", wsMsg);
        break;
    }
  };

  // Handle register message
  const processRegisterMessage = (msg: RegisterResponse) => {
    actions.setErrorMessage(null);
    actions.setTransferConnection({ senderId: msg.connId });

    if (!fileMetadata) {
      const errorMsg = "File metadata not available";
      actions.setErrorMessage(errorMsg);
      console.error(errorMsg);
      return;
    }
    sendJsonMessage({
      type: "fileMeta",
      name: fileMetadata.name,
      size: fileMetadata.size,
      mimeType: fileMetadata.type,
    } satisfies FileMetaRequest);

    actions.setTransferShareLink(
      `${window.location.origin}/receive?id=${msg.connId}`,
    );
    actions.setIsLoading(false);
  };

  // Handle recipient ready message
  const processRecipientReadyMessage = (msg: RecipientReadyResponse) => {
    actions.setErrorMessage(null);
    actions.setTransferConnection({ recipientId: msg.recipientId });
    sendJsonMessage({
      type: "senderAck",
      requestType: "recipientReady",
      recipientId: msg.recipientId,
      status: "success",
    } satisfies SenderAckRequest);
    actions.setTransferStatus({
      isTransferring: false,
      isTransferError: false,
      isTransferCanceled: false,
      isTransferCompleted: false,
    });
    actions.clearTransferState();
  };

  // Handle cancel recipient ready message
  const processCancelRecipientReadyMessage = (
    msg: CancelRecipientReadyResponse,
  ) => {
    actions.setTransferConnection({ recipientId: null });
    const errorMsg = `Recipient \`${msg.recipientId}\` canceled the connection`;
    actions.setErrorMessage(errorMsg);
  };

  // Handle file transfer acknowledgment message
  const processFileTransferAcknowledgmentMessage = (
    ack: FileTransferAckResponse,
  ) => {
    if (!file) {
      const errorMsg = "No file found. Cannot process acknoledgment";
      actions.setErrorMessage(errorMsg);
      console.error(errorMsg);
      return;
    }

    const { isTransferCanceled } = useFileSenderStore.getState().transferStatus;
    if (isTransferCanceled) return;

    if (ack.status === "acknowledged") {
      if (
        chunkIndex !== ack.chunkIndex &&
        senderProgress !== ack.recipientTransferProgress
      ) {
        actions.setErrorMessage(
          "Upload out of sync. Please try again or check your connection",
        );
        actions.setTransferStatus({
          isTransferring: false,
          isTransferError: true,
          isTransferCanceled: false,
          isTransferCompleted: false,
        });
        return;
      }
      actions.setTransferStatus({
        offset: offset + chunkDataSize,
        chunkIndex: chunkIndex + 1,
      });
      actions.setTransferProgress({ receiver: ack.recipientTransferProgress });

      if (!isTransferCanceled) actions.sendNextChunk();
    } else if (ack.status === "completed") {
      actions.setTransferStatus({
        isTransferring: false,
        isTransferError: false,
        isTransferCanceled: false,
        isTransferCompleted: true,
      });

      // Close the WebSocket connection gracefully after transfer completion
      const ws = getWebSocket();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close(
          1000,
          `Sender [${senderId}]: Transfer completed, closing WebSocket connection.`,
        );
      }
    } else if (ack.status === "error") {
      actions.setTransferStatus({
        isTransferring: false,
        isTransferError: true,
        isTransferCanceled: false,
        isTransferCompleted: false,
      });
      actions.setErrorMessage("Transfer failed: receiver reported an error.");
      console.error("[Sender] Receiver reported file transfer error", {
        chunkIndex: ack.chunkIndex,
        receiverProgress: ack.recipientTransferProgress,
        uploadedSize: ack.uploadedSize,
      });
    } else {
      const errorMsg = `Unknown acknowledgment status: ${ack.status}`;
      actions.setErrorMessage(errorMsg);
      console.error(errorMsg);
    }
  };

  // Handle cancel recipient transfer message
  const processCancelRecipientTransferMessage = (
    msg: CancelRecipientTransferResponse,
  ) => {
    actions.setTransferStatus({ isTransferCanceled: true });
    const errorMsg = `Recipient \`${msg.recipientId}\` canceled the transfer`;
    actions.setErrorMessage(errorMsg);
  };

  // Handle WebSocket close event
  const processWebSocketOnClose = (close: CloseEvent) => {
    console.info("❌ Disconnected", close.code);

    actions.setWebSocketUrl(null);
    actions.setTransferShareLink(null);
    actions.setTransferConnection({ senderId: null, recipientId: null });

    if (close.code === 1000) return;
    else if (close.code === 1006) {
      actions.setErrorMessage("Lost connection to the server");
    } else {
      actions.setErrorMessage(`Disconnected: Code ${close.code}`);
    }
  };

  // Set WebSocket handlers in the store
  useEffect(() => {
    if (sendJsonMessage && sendMessage) {
      actions.setWebSocketHandlers({
        sendJsonMessage: sendJsonMessage,
        sendMessage: sendMessage,
        getWebSocket: getWebSocket,
      });
    }
  }, [sendJsonMessage, sendMessage, getWebSocket, actions]);

  // Handle beforeunload event to cancel transfer if necessary
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      const canSend = readyState === WebSocket.OPEN && recipientId;
      if (!canSend) return;

      e.preventDefault();

      if (isTransferring) {
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
  }, [readyState, sendJsonMessage, isTransferring, recipientId]);

  return { readyState };
}
