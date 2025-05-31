import { useEffect } from "react";

import useWebsocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";

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

export function UseFileReceiverSocket(): { readyState: ReadyState } {
  const webSocketUrl = useFileReceiverStore((state) => state.webSocketUrl);

  const { senderId, isConnected } = useFileReceiverStore(
    (state) =>
      state.transferConnection as { senderId: string; isConnected: boolean },
  );

  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);

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
    actions.setTransferConnection({ recipientId: msg.connId });
  };

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

  const processSenderAckMessage = (msg: SenderAckResponse) => {
    switch (msg.requestType) {
      case "recipientReady":
        actions.setTransferConnection({ isConnected: true });
        break;
      default:
        console.error("[WebSocket] Unknown ack request type received:", msg);
        break;
    }
  };

  const processFileChunkMessage = (msg: FileChunkResponse) => {
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

  const processFileEndMessage = (msg: FileEndResponse) => {
    if (!fileMetadata) return;

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

      actions.setErrorMessage(
        "Mismatch in file transfer data. Transfer may be corrupted.",
      );
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
      chunkIndex,
      chunkDataSize,
      uploadedSize,
      recipientTransferProgress: receiverTransferProgress,
    } satisfies FileTransferAckPayload);

    actions.finalizeTransfer();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const processRestartTransferMessage = (_msg: RestartTransferResponse) => {
    actions.clearTransferState();
    toast.info("Sender restarted the transfer.");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const processCancelSenderTransferMessage = (_msg: CancelSenderTransfer) => {
    actions.setTransferStatus({ isTransferCanceled: true });
    toast.error("Transfer aborted by sender.");
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
      if (isTransferring) {
        e.preventDefault();

        if (readyState === WebSocket.OPEN && senderId && isConnected) {
          sendJsonMessage({
            type: "cancelRecipientTransfer",
            senderId,
          });
        }
      } else if (readyState === WebSocket.OPEN && senderId && isConnected) {
        sendJsonMessage({
          type: "cancelRecipientReady",
          senderId,
        } satisfies CancelRecipientReadyPayload);
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isTransferring, readyState, isConnected, sendJsonMessage, senderId]);

  return { readyState };
}
