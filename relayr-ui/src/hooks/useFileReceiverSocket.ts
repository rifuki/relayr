// React
import { useEffect } from "react";

// External Libraries
import useWebSocket from "react-use-websocket";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

// WebSocket Message Types
import {
  CancelRecipientReadyRequest,
  CancelRecipientTransferRequest,
  CancelSenderReadyResponse,
  CancelSenderTransferResponse,
  FileChunkResponse,
  FileEndResponse,
  FileTransferAckRequest,
  RecipientReadyRequest,
  RegisterResponse,
  RestartTransferResponse,
  SenderAckResponse,
  WebSocketReceiverTextMessageResponse,
} from "@/types/webSocketMessages";

export function useFileReceiverSocket() {
  // Extracting necessary values from the store
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);
  const webSocketUrl = useFileReceiverStore((state) => state.webSocketUrl);
  const { senderId, isConnected, recipientId } = useFileReceiverStore(
    (state) =>
      state.transferConnection as {
        senderId: string;
        isConnected: boolean;
        recipientId: string;
      },
  );
  const { totalChunks } = useFileReceiverStore(
    (state) => state.fileTransferInfo,
  );
  const {
    uploadedSize,
    receivedBytes,
    chunkIndex,
    chunkDataSize,
    isTransferring,
  } = useFileReceiverStore((state) => state.transferStatus);
  const { receiver: receiverTransferProgress } = useFileReceiverStore(
    (state) => state.transferProgress,
  );
  const actions = useFileReceiverActions();

  // Setting up WebSocket connection
  const { readyState, sendJsonMessage, getWebSocket } = useWebSocket(
    webSocketUrl,
    {
      onMessage: (wsMsg: MessageEvent<string | Blob>) => {
        if (wsMsg.data instanceof Blob) {
          processWebSocketBlobMessage(wsMsg.data);
        } else if (typeof wsMsg.data === "string") {
          try {
            const parsedMessage = JSON.parse(wsMsg.data);
            processWebSocketTextMessage(parsedMessage);
          } catch (error: unknown) {
            console.error("❌ Error parsing websocket message:", error);
          }
        }
      },
      onClose: (close: CloseEvent) => processWebSocketOnClose(close),
      onError: (error: Event) => {
        console.error("🔥 Error", error);
        actions.setErrorMessage("WebSocket error occurred");
      },
    },
  );

  // Sync readyState to store
  useEffect(() => {
    actions.setWebSocketReadyState(readyState);
  }, [readyState, actions]);

  // Sync WebSocket handlers to store
  useEffect(() => {
    actions.setWebSocketHandlers({
      sendJsonMessage,
      getWebSocket,
    });
  }, [sendJsonMessage, getWebSocket, actions]);

  // Handle incoming Blob data from WebSocket
  const processWebSocketBlobMessage = async (blobData: Blob) => {
    const { isTransferCanceled } =
      useFileReceiverStore.getState().transferStatus;
    if (isTransferCanceled || !fileMetadata) return;

    try {
      const arrayBufferData = await blobData.arrayBuffer();
      actions.setReceivedChunkData(arrayBufferData);
      const newReceivedBytes = receivedBytes + arrayBufferData.byteLength;
      actions.setTransferStatus({ receivedBytes: newReceivedBytes });
      const receiverTransferProgress = Math.min(
        100,
        Math.floor((newReceivedBytes / fileMetadata.size) * 100),
      );
      actions.setTransferProgress({ receiver: receiverTransferProgress });

      sendJsonMessage({
        type: "fileTransferAck",
        senderId,
        status: "acknowledged",
        fileName: fileMetadata.name,
        totalChunks,
        uploadedSize,
        chunkIndex,
        chunkDataSize,
        recipientTransferProgress: receiverTransferProgress,
      } satisfies FileTransferAckRequest);
    } catch (error: unknown) {
      console.error("Failed to read blob as ArrayBuffer:" + error);
    }
  };

  // Handle incoming text WebSocket messages
  const processWebSocketTextMessage = (
    wsMsg: WebSocketReceiverTextMessageResponse,
  ) => {
    if (!wsMsg.success) {
      const shouldClose =
        wsMsg.message
          ?.toLowerCase()
          .includes("sender is already connected to recipient") ||
        wsMsg.message === "Please ask the sender to generate new link";

      if (shouldClose) {
        const ws = getWebSocket?.();
        if (ws && ws.readyState === WebSocket.OPEN) {
          const errorMsg = wsMsg.message
            ?.toLowerCase()
            .includes("sender is already connected to recipient")
            ? "Sender already connected to another recipent."
            : wsMsg.message;
          actions.setErrorMessage(errorMsg);
          ws.close(1000, errorMsg);

          actions.setWebSocketUrl(null);
        }
      } else {
        actions.setErrorMessage(wsMsg.message ?? "unknown error occurred");
      }
      return;
    }

    // Process specific WebSocket message types
    switch (wsMsg.type) {
      case "register":
        processRegisterMessage(wsMsg);
        break;
      case "cancelSenderReady":
        processCancelSenderReadyMessage(wsMsg);
        break;
      case "senderAck":
        processSenderAckMessage(wsMsg);
        break;
      case "fileChunk":
        processFileChunkMessage(wsMsg);
        break;
      case "fileEnd":
        processFileEndMessage(wsMsg);
        break;
      case "restartTransfer":
        processRestartTransferMessage(wsMsg);
        break;
      case "cancelSenderTransfer":
        processCancelSenderTransferMessage(wsMsg);
        break;
      default:
        console.error("[WebSocket] Unknown message type received:", wsMsg);
        break;
    }
  };

  // Process incoming 'register' WebSocket message
  const processRegisterMessage = (msg: RegisterResponse) => {
    actions.setErrorMessage(null);
    actions.setTransferConnection({ recipientId: msg.connId });

    sendJsonMessage({
      type: "recipientReady",
      senderId,
    } satisfies RecipientReadyRequest);
  };

  // Process incoming 'cancelSenderReady' message
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const processCancelSenderReadyMessage = (_msg: CancelSenderReadyResponse) => {
    const errMsg = "The sender has canceled the connection";
    getWebSocket()?.close(1000, errMsg);
    actions.setErrorMessage(errMsg);
    actions.clearTransferState();
    actions.setTransferConnection({
      isConnected: false,
      recipientId: null,
    });
  };

  // Process incoming 'senderAck' message
  const processSenderAckMessage = (msg: SenderAckResponse) => {
    switch (msg.requestType) {
      case "recipientReady":
        actions.setTransferConnection({ isConnected: true });
        break;
      case "uploadOutOfSync":
        actions.setErrorMessage(
          "The sender's upload is out of sync. Please ask the sender to restart the transfer.",
        );
        actions.setTransferStatus({
          isTransferError: true,
          isTransferring: false,
        });
        break;
      default:
        console.error("[WebSocket] Unknown ack request type received:", msg);
        break;
    }
  };

  // Process incoming 'fileChunk' message
  const processFileChunkMessage = (msg: FileChunkResponse) => {
    const { isTransferCanceled } =
      useFileReceiverStore.getState().transferStatus;

    if (isTransferCanceled && msg.chunkIndex !== 0) return;

    if (msg.chunkIndex === 0) {
      actions.setErrorMessage(null);
      actions.setTransferStatus({
        isTransferCanceled: false,
        isTransferError: false,
      });
      actions.clearTransferState();
    }

    actions.setFileTransferInfo({
      totalSize: msg.totalSize,
      totalChunks: msg.totalChunks,
    });

    actions.setTransferStatus({
      isTransferring: true,
      isTransferCanceled: false,
      uploadedSize: msg.uploadedSize,
      chunkIndex: msg.chunkIndex,
      chunkDataSize: msg.chunkDataSize,
    });

    actions.setTransferProgress({ sender: msg.senderTransferProgress });
  };

  // Process incoming 'fileEnd' message
  const processFileEndMessage = (msg: FileEndResponse) => {
    const { isTransferCanceled } =
      useFileReceiverStore.getState().transferStatus;
    if (isTransferCanceled || !fileMetadata) return;

    const isChunkIndexConsistent = msg.lastChunkIndex === chunkIndex + 1;
    actions.setTransferStatus({ chunkIndex: msg.lastChunkIndex });
    const isUploadedSizeConsistent = msg.uploadedSize === receivedBytes;

    if (!isChunkIndexConsistent || !isUploadedSizeConsistent) {
      console.error("[FileEnd] Payload mismatch", {
        lastChunkIndexFromSender: msg.lastChunkIndex,
        currentChunkIndex: chunkIndex + 1,
        uploadedSizeFromSender: msg.uploadedSize,
        receivedBytesFromClient: receivedBytes,
      });
      actions.setErrorMessage(
        "Mismatch in file transfer data. Transfer may be corrupted.",
      );

      sendJsonMessage({
        type: "fileTransferAck",
        senderId,
        status: "error",
        fileName: fileMetadata.name,
        totalChunks,
        uploadedSize,
        chunkIndex,
        chunkDataSize,
        recipientTransferProgress: receiverTransferProgress,
      } satisfies FileTransferAckRequest);

      actions.setTransferStatus({
        isTransferError: true,
        isTransferring: false,
      });

      return;
    }

    sendJsonMessage({
      type: "fileTransferAck",
      senderId,
      status: "completed",
      fileName: fileMetadata.name,
      totalChunks,
      uploadedSize,
      chunkIndex,
      chunkDataSize,
      recipientTransferProgress: receiverTransferProgress,
    } satisfies FileTransferAckRequest);

    // Finalize the file transfer by reconstructing the file from received chunks,
    // validating its integrity, and updating the transfer state accordingly.
    actions.finalizeTransfer();

    // Close the WebSocket connection gracefully after transfer completion
    const ws = getWebSocket();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close(
        1000,
        `Receiver [${recipientId}]: Transfer completed, closing WebSocket connection.`,
      );
    }
  };

  // Process incoming 'restartTransfer' message
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const processRestartTransferMessage = (_msg: RestartTransferResponse) => {
    actions.setErrorMessage(null);
    actions.setTransferStatus({
      isTransferCanceled: false,
      isTransferError: false,
    });
    actions.clearTransferState();
    actions.setErrorMessage("Sender restarted the transfer.");
  };

  // Process incoming 'cancelSenderTransfer' message
  const processCancelSenderTransferMessage = (
    msg: CancelSenderTransferResponse,
  ) => {
    actions.setTransferStatus({ isTransferCanceled: true });
    const errorMsg = `Sender \`${msg.senderId}\` canceled the transfer`;
    actions.setErrorMessage(errorMsg);
  };

  // WebSocket onClose handler
  const processWebSocketOnClose = (close: CloseEvent) => {
    console.info("❌ Disconnected", close.code);

    actions.setWebSocketUrl(null);
    actions.setTransferConnection({ isConnected: false, recipientId: null });

    if (close.code === 1000) return;
    else if (close.code === 1006) {
      actions.setErrorMessage("Lost connection to the server");
    } else {
      actions.setErrorMessage(`Disconnected: Code ${close.code}`);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function handleBeforeUnload(_e: BeforeUnloadEvent) {
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
  }, [isTransferring, readyState, isConnected, sendJsonMessage, senderId]);
}
