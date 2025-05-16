import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";
import {
  CancelRecipientReadyPayload,
  CancelSenderReadyResponse,
  CancelSenderTransfer,
  FileChunkResponse,
  FileEndResponse,
  FileTransferAckPayload,
  RecipientReadyPayload,
  RegisterResponse,
  RestartTransferResponse,
  SenderAckResponse,
  WebSocketReceiverTextMessageResponse,
} from "@/types/webSocketMessages";
import { useEffect } from "react";
import useWebsocket from "react-use-websocket";
import { toast } from "sonner";

export function UseFileReceiverSocket() {
  const webSocketUrl = useFileReceiverStore((state) => state.webSocketUrl);

  const senderId = useFileReceiverStore((state) => state.senderId as string);
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);

  const totalChunks = useFileReceiverStore((state) => state.totalChunks);
  //const totalSize = useFileReceiverStore((state) => state.totalSize);
  const chunkIndex = useFileReceiverStore((state) => state.chunkIndex);
  const chunkDataSize = useFileReceiverStore((state) => state.chunkDataSize);
  const uploadedSize = useFileReceiverStore((state) => state.uploadedSize);

  const receivedBytes = useFileReceiverStore((state) => state.receivedBytes);
  const receiverTransferProgress = useFileReceiverStore(
    (state) => state.receiverTransferProgress,
  );

  const isSenderTransferring = useFileReceiverStore(
    (state) => state.isSenderTransferring,
  );
  const isConnectedToSender = useFileReceiverStore(
    (state) => state.isConnectedToSender,
  );

  const actions = useFileReceiverActions();

  const { readyState, sendJsonMessage, getWebSocket } = useWebsocket(
    webSocketUrl,
    {
      onOpen: () => {
        sendJsonMessage({
          type: "recipientReady",
          senderId,
        } satisfies RecipientReadyPayload);
      },
      onMessage: (wsMsg: MessageEvent<string | Blob>) => {
        actions.setErrorMessage(null);

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

  const processWebSocketBlobMessage = async (blobData: Blob) => {
    if (!fileMetadata) return;
    try {
      const arrayBufferData = await blobData.arrayBuffer();
      actions.setReceivedChunkData(arrayBufferData);
      const newReceivedBytes = receivedBytes + arrayBufferData.byteLength;
      actions.setReceivedBytes(newReceivedBytes);
      const receiverTransferProgress = Math.min(
        100,
        Math.floor((newReceivedBytes / fileMetadata.size) * 100),
      );
      actions.setReceiverTransferProgress(receiverTransferProgress);

      sendJsonMessage({
        type: "fileTransferAck",
        senderId,
        status: "acknowledged",
        fileName: fileMetadata.name,
        totalChunks,
        chunkIndex,
        chunkDataSize,
        uploadedSize,
        recipientTransferProgress: receiverTransferProgress,
      } satisfies FileTransferAckPayload);
    } catch (error: unknown) {
      console.error("Failed to read blob as ArrayBuffer:" + error);
    }
  };

  const processWebSocketTextMessage = (
    wsMsg: WebSocketReceiverTextMessageResponse,
  ) => {
    if (!wsMsg.success) {
      if (
        wsMsg.message
          .toLowerCase()
          .includes("sender is already connected to recipient")
      ) {
        actions.setErrorMessage("Sender is already connected to recipient");
        const ws = getWebSocket?.();
        if (ws?.readyState === WebSocket.OPEN) {
          actions.setWebSocketUrl(null);
          ws?.close(1000, "Sender already connected to another recipent.");
        }
      }

      actions.setErrorMessage(wsMsg.message ?? "unknown error occurred");
      return;
    }

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

  const processRegisterMessage = (msg: RegisterResponse) => {
    actions.setRecipientId(msg.connId);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const processCancelSenderReadyMessage = (_msg: CancelSenderReadyResponse) => {
    const errMsg = "The sender has canceled the connection";
    actions.setErrorMessage(errMsg);
    actions.setIsConnectedToSender(false);
    getWebSocket()?.close(1000, errMsg);
    actions.setRecipientId(null);
  };

  const processSenderAckMessage = (msg: SenderAckResponse) => {
    switch (msg.requestType) {
      case "recipientReady":
        actions.setIsConnectedToSender(true);
        break;
      default:
        console.error("[WebSocket] Unknown ack request type received:", msg);
        break;
    }
  };

  const processFileChunkMessage = (msg: FileChunkResponse) => {
    actions.setIsSenderTransferring(true);
    actions.setTotalSize(msg.totalSize);
    actions.setTotalChunks(msg.totalChunks);
    actions.setChunkIndex(msg.chunkIndex);
    actions.setChunkDataSize(msg.chunkDataSize);
    actions.setUploadedSize(msg.uploadedSize);
    actions.setSenderTransferProgress(msg.senderTransferProgress);
  };

  const processFileEndMessage = (msg: FileEndResponse) => {
    if (!fileMetadata) return;

    const isChunkIndexConsistent = msg.lastChunkIndex === chunkIndex + 1;
    actions.setChunkIndex(msg.lastChunkIndex);
    const isUploadedSizeConsistent = msg.uploadedSize === receivedBytes;

    if (!isChunkIndexConsistent || !isUploadedSizeConsistent) {
      console.error("[FileEnd] Payload mismatch", {
        lastChunkIndexFromSender: msg.lastChunkIndex,
        currentChunkIndex: chunkIndex + 1,
        uploadedSizeFromSender: msg.uploadedSize,
        receivedBytesFromClient: receivedBytes,
      });
      actions.setIsTransferError(true);

      actions.setErrorMessage(
        "Mismatch in file transfer data. Transfer may be corrupted.",
      );

      sendJsonMessage({
        type: "fileTransferAck",
        senderId,
        status: "error",
        fileName: fileMetadata.name,
        totalChunks,
        chunkIndex,
        chunkDataSize,
        uploadedSize,
        recipientTransferProgress: receiverTransferProgress,
      } satisfies FileTransferAckPayload);

      actions.setIsSenderTransferring(false);
      return;
    }

    sendJsonMessage({
      type: "fileTransferAck",
      senderId,
      status: "completed",
      fileName: fileMetadata.name,
      totalChunks,
      chunkIndex,
      chunkDataSize,
      uploadedSize,
      recipientTransferProgress: receiverTransferProgress,
    } satisfies FileTransferAckPayload);

    actions.finalizeTransfer();
    actions.setIsSenderTransferring(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const processRestartTransferMessage = (_msg: RestartTransferResponse) => {
    actions.resetTransferStatus();
    actions.setIsSenderTransferring(false);
    actions.setIsTransferError(false);
    toast.info("Sender restarted the transfer.");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const processCancelSenderTransferMessage = (_msg: CancelSenderTransfer) => {
    actions.resetTransferStatus();
    actions.setIsSenderTransferring(false);
    actions.setIsTransferError(false);
    actions.setErrorMessage("Transfer aborted by sender.");
  };

  const processWebSocketOnClose = (close: CloseEvent) => {
    console.info("❌ Disconnected", close.code);

    actions.setWebSocketUrl(null);

    if (close.code === 1000) return;
    else if (close.code === 1006) {
      actions.setErrorMessage("Lost connection to the server");
    } else {
      actions.setErrorMessage(`Disconnected: Code ${close.code}`);
    }
  };

  useEffect(() => {
    actions.setWebSocketHandlers({
      sendJsonMessage,
      getWebSocket,
    });
  }, [sendJsonMessage, getWebSocket, actions]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isSenderTransferring) {
        e.preventDefault();
      } else if (readyState === WebSocket.OPEN && isConnectedToSender) {
        sendJsonMessage({
          type: "cancelRecipientReady",
          senderId,
        } satisfies CancelRecipientReadyPayload);
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    isSenderTransferring,
    readyState,
    isConnectedToSender,
    sendJsonMessage,
    senderId,
  ]);

  return { readyState };
}
