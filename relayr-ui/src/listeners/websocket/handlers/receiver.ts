// External Libraries Type
import { WebSocketHook } from "react-use-websocket/dist/lib/types";

// Types
import type {
  FileReceiverActions,
  FileTransferInfo,
  TransferConnection,
  TransferProgress,
  TransferStatus,
} from "@/stores/useFileReceiverStore";
import type { FileMetadata } from "@/types/file";
import type {
  CancelSenderReadyResponse,
  CancelSenderTransferResponse,
  FileChunkResponse,
  FileEndResponse,
  FileTransferAckRequest,
  RecipientReadyRequest,
  RegisterResponse,
  RestartTransferResponse,
  SenderAckResponse,
  UserCloseRequest,
  WebSocketReceiverTextMessageResponse,
} from "@/types/webSocketMessages";

// Handle incoming text WebSocket messages
interface ProcessWebSocketTextMessageDeps {
  actions: FileReceiverActions;
  fileMetadata: FileMetadata | null;
  transferConnection: TransferConnection;
  fileTransferInfo: FileTransferInfo;
  transferStatus: TransferStatus;
  transferProgress: TransferProgress;
  readyState: WebSocketHook["readyState"];
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
}
export function processWebSocketTextMessage(
  wsMsg: WebSocketReceiverTextMessageResponse,
  deps: ProcessWebSocketTextMessageDeps,
) {
  const {
    actions,
    fileMetadata,
    transferConnection,
    fileTransferInfo,
    transferStatus,
    transferProgress,
    readyState,
    sendJsonMessage,
  } = deps;
  const { recipientId } = transferConnection;

  if (!wsMsg.success) {
    const shouldClose =
      wsMsg.message
        ?.toLowerCase()
        .includes("sender is already connected to recipient") ||
      wsMsg.message === "Please ask the sender to generate new link";

    if (shouldClose) {
      if (readyState === WebSocket.OPEN) {
        const errorMsg = wsMsg.message
          ?.toLowerCase()
          .includes("sender is already connected to recipient")
          ? "Sender already connected to another recipent."
          : wsMsg.message;
        actions.setErrorMessage(errorMsg);

        if (!recipientId)
          throw new Error(
            "Recipient ID is not available in transfer connection",
          );

        sendJsonMessage({
          type: "userClose",
          userId: recipientId,
          role: "receiver",
          reason: errorMsg,
        } satisfies UserCloseRequest);
      }
    } else {
      actions.setErrorMessage(wsMsg.message ?? "unknown error occurred");
    }
    return;
  }

  // Process specific WebSocket message types
  switch (wsMsg.type) {
    case "register":
      processRegisterMessage(wsMsg, {
        actions,
        transferConnection,
        sendJsonMessage,
      });
      break;
    case "senderAck":
      processSenderAckMessage(wsMsg, { actions, transferConnection });
      break;
    case "cancelSenderReady":
      processCancelSenderReadyMessage(wsMsg, {
        actions,
        transferConnection,
        sendJsonMessage,
      });
      break;
    case "fileChunk":
      processFileChunkMessage(wsMsg, {
        actions,
        transferStatus,
      });
      break;
    case "fileEnd":
      processFileEndMessage(wsMsg, {
        actions,
        fileMetadata,
        transferConnection,
        fileTransferInfo,
        transferStatus,
        transferProgress,
        sendJsonMessage,
      });
      break;
    case "restartTransfer":
      processRestartTransferMessage(wsMsg, { actions });
      break;
    case "cancelSenderTransfer":
      processCancelSenderTransferMessage(wsMsg, { actions });
      break;
    default:
      console.error("[WebSocket] Unknown message type received:", wsMsg);
      break;
  }
}

// Process incoming 'register' message
interface ProcessRegisterMessageDeps {
  actions: FileReceiverActions;
  transferConnection: TransferConnection;
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
}
function processRegisterMessage(
  msg: RegisterResponse,
  deps: ProcessRegisterMessageDeps,
) {
  const { actions, transferConnection, sendJsonMessage } = deps;
  const { senderId } = transferConnection;

  if (!senderId) {
    console.error("Sender ID is not available in transfer connection");
    return;
  }

  actions.setErrorMessage(null);
  actions.setTransferConnection({ recipientId: msg.connId });

  sendJsonMessage({
    type: "recipientReady",
    senderId,
  } satisfies RecipientReadyRequest);
}

// Process incoming 'senderAck' message
interface ProcessSenderAckMessageDeps {
  actions: FileReceiverActions;
  transferConnection: TransferConnection;
}
function processSenderAckMessage(
  msg: SenderAckResponse,
  deps: ProcessSenderAckMessageDeps,
) {
  const { actions, transferConnection } = deps;
  const { isConnected } = transferConnection;

  switch (msg.requestType) {
    case "recipientReady":
      if (!isConnected) {
        actions.setTransferConnection({ isConnected: true });
      }
      break;
    case "uploadOutOfSync":
      actions.setErrorMessage(
        "The sender's upload is out of sync. Please ask the sender to restart the transfer.",
      );
      actions.setTransferStatus({
        isTransferring: false,
        isTransferError: true,
      });
      break;
    default:
      console.error("[WebSocket] Unknown ack request type received:", msg);
      break;
  }
}

// Process incoming 'cancelSenderReady' message
interface ProcessCancelSenderReadyMessageDeps {
  actions: FileReceiverActions;
  transferConnection: TransferConnection;
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
}
function processCancelSenderReadyMessage(
  _msg: CancelSenderReadyResponse,
  deps: ProcessCancelSenderReadyMessageDeps,
) {
  const { actions, transferConnection, sendJsonMessage } = deps;
  const { recipientId } = transferConnection;

  if (!recipientId) {
    console.error("Recipient ID is not available in transfer connection");
    return;
  }
  const errMsg = "The sender has canceled the connection";

  sendJsonMessage({
    type: "userClose",
    userId: recipientId,
    role: "receiver",
    reason: errMsg,
  } satisfies UserCloseRequest);

  actions.setErrorMessage(errMsg);
  actions.clearTransferState();
  actions.setTransferConnection({
    isConnected: false,
    recipientId: null,
  });
}

// Process incoming 'fileChunk' message
interface ProcessFileChunkMessageDeps {
  actions: FileReceiverActions;
  transferStatus: TransferStatus;
}
function processFileChunkMessage(
  msg: FileChunkResponse,
  deps: ProcessFileChunkMessageDeps,
) {
  const { actions, transferStatus } = deps;
  const { isTransferCanceled } = transferStatus;

  // Cancel the transfer if it has been canceled and this is not the first chunk
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
}

// Process incoming 'fileEnd' message
interface ProcessFileEndMessageDeps {
  actions: FileReceiverActions;
  fileMetadata: FileMetadata | null;
  fileTransferInfo: FileTransferInfo;
  transferConnection: TransferConnection;
  transferStatus: TransferStatus;
  transferProgress: TransferProgress;
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
}
function processFileEndMessage(
  msg: FileEndResponse,
  deps: ProcessFileEndMessageDeps,
) {
  const {
    actions,
    fileMetadata,
    transferConnection,
    fileTransferInfo,
    transferStatus,
    transferProgress,
    sendJsonMessage,
  } = deps;
  const { senderId, recipientId } = transferConnection;
  const { totalChunks } = fileTransferInfo;
  const {
    uploadedSize,
    receivedBytes,
    chunkIndex,
    chunkDataSize,
    isTransferCanceled,
    isTransferCompleted,
  } = transferStatus;
  const { receiver: receiverTransferProgress } = transferProgress;

  if (!fileMetadata || !senderId || isTransferCanceled || isTransferCompleted)
    return;

  if (!recipientId) {
    console.error("Recipient ID is not available in transfer connection");
    return;
  }

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
  sendJsonMessage({
    type: "userClose",
    userId: recipientId!,
    role: "receiver",
    reason: `Transfer completed for file "${fileMetadata.name}". Closing connection.`,
  } satisfies UserCloseRequest);
}

// Process incoming 'restartTransfer' message
interface ProcessRestartTransferMessageDeps {
  actions: FileReceiverActions;
}
function processRestartTransferMessage(
  _msg: RestartTransferResponse,
  deps: ProcessRestartTransferMessageDeps,
) {
  const { actions } = deps;

  actions.setErrorMessage(null);
  actions.setTransferStatus({
    isTransferError: false,
    isTransferCanceled: false,
  });
  actions.clearTransferState();
  actions.setErrorMessage("Sender restarted the transfer.");
}

// Process incoming 'cancelSenderTransfer' message
interface ProcessCancelSenderTransferMessageDeps {
  actions: FileReceiverActions;
}
function processCancelSenderTransferMessage(
  msg: CancelSenderTransferResponse,
  deps: ProcessCancelSenderTransferMessageDeps,
) {
  const { actions } = deps;

  actions.setTransferStatus({ isTransferCanceled: true });
  const errorMsg = `Sender \`${msg.senderId}\` canceled the transfer`;
  actions.setErrorMessage(errorMsg);
}

// Handle incoming Blob data from WebSocket
interface ProcessWebSocketBlobMessageDeps {
  actions: FileReceiverActions;
  fileMetadata: FileMetadata | null;
  transferConnection: TransferConnection;
  fileTransferInfo: FileTransferInfo;
  transferStatus: TransferStatus;
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
}
export async function processWebSocketBlobMessage(
  blobData: Blob,
  deps: ProcessWebSocketBlobMessageDeps,
) {
  const {
    actions,
    fileMetadata,
    transferConnection,
    fileTransferInfo,
    transferStatus,
    sendJsonMessage,
  } = deps;
  const { senderId } = transferConnection;
  const { totalChunks } = fileTransferInfo;
  const {
    uploadedSize,
    receivedBytes,
    chunkIndex,
    chunkDataSize,
    isTransferCanceled,
  } = transferStatus;

  if (!fileMetadata || !senderId || isTransferCanceled) return;

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
}
