// External Libraries Type
import type { WebSocketHook } from "react-use-websocket/dist/lib/types";

// Types
import type {
  FileReceiverActions,
  FileTransferInfo,
  TransferConnection,
  TransferProgress,
  TransferStatus,
} from "@/stores/useFileReceiverStore";
import type { FileMetadata } from "@/types/file";
import {
  errorCodeMessages,
  type CancelSenderReadyResponse,
  type CancelSenderTransferResponse,
  type ErrorMessageResponse,
  type FileChunkResponse,
  type FileEndResponse,
  type FileTransferAckRequest,
  type PeerDisconnectedResponse,
  type RecipientReadyRequest,
  type RegisterResponse,
  type RestartTransferResponse,
  type SenderAckResponse,
  type UserCloseRequest,
  type WebSocketReceiverTextMessageResponse,
} from "@/types/webSocketMessages";

// Process incoming WebSocket text messages
interface ProcessWebSocketTextMessageDeps {
  actions: FileReceiverActions;
  fileMetadata: FileMetadata | null;
  transferConnection: TransferConnection;
  fileTransferInfo: FileTransferInfo;
  transferStatus: TransferStatus;
  transferProgress: TransferProgress;
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
    sendJsonMessage,
  } = deps;

  if (!wsMsg.success) {
    handleWebSocketTextErrorMessage(wsMsg, {
      transferConnection,
      sendJsonMessage,
      actions,
    });

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
      processSenderAckMessage(wsMsg, { actions });
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
    case "peerDisconnected":
      processPeerDisconnectedMessage(wsMsg, {
        actions,
        sendJsonMessage,
        transferConnection,
      });
      break;
    default:
      console.error("[Receiver] Unknown WebSocket message:", wsMsg);
      break;
  }
}

// Handle WebSocket text error messages
interface handleWebSocketTextErrorMessageArgs {
  transferConnection: TransferConnection;
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
  actions: FileReceiverActions;
}
function handleWebSocketTextErrorMessage(
  wsMsg: ErrorMessageResponse,
  args: handleWebSocketTextErrorMessageArgs,
) {
  const { transferConnection, sendJsonMessage, actions } = args;
  const { recipientId } = transferConnection;

  const errorMessage =
    errorCodeMessages[wsMsg.code] ||
    wsMsg.message ||
    "An unknown error occurred";

  sendJsonMessage({
    type: "userClose",
    userId: recipientId!,
    role: "receiver",
    reason: errorMessage,
  } satisfies UserCloseRequest);

  actions.setErrorMessage(errorMessage);
  actions.setTransferStatus({
    isTransferring: false,
    isTransferError: true,
    isTransferCanceled: false,
    isTransferCompleted: false,
  });
  actions.clearTransferState();
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

  actions.setErrorMessage(null);
  sendJsonMessage({
    type: "recipientReady",
    senderId: senderId!,
  } satisfies RecipientReadyRequest);
  actions.setTransferConnection({ recipientId: msg.connId });
}

// Process incoming 'senderAck' message
interface ProcessSenderAckMessageDeps {
  actions: FileReceiverActions;
}
function processSenderAckMessage(
  msg: SenderAckResponse,
  deps: ProcessSenderAckMessageDeps,
) {
  const { actions } = deps;

  switch (msg.requestType) {
    case "recipientReady":
      actions.setErrorMessage(null);

      actions.clearTransferState();
      actions.setTransferConnection({ isConnected: true });
      actions.setTransferStatus({
        isTransferring: false,
        isTransferError: false,
        isTransferCanceled: false,
        isTransferCompleted: false,
      });
      break;
    case "uploadOutOfSync":
      actions.setErrorMessage(
        "Download out of sync. Please ask the sender to restart the transfer.",
      );
      actions.setTransferStatus({
        isTransferring: false,
        isTransferError: true,
        isTransferCanceled: false,
        isTransferCompleted: false,
      });
      break;
    default:
      console.error(
        "[Receiver] Unknown senderAck request type:",
        msg.requestType,
      );
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

  if (!transferConnection.isConnected) return;

  actions.setErrorMessage("Sender canceled the transfer before it started");
  actions.setTransferConnection({
    isConnected: false,
    recipientId: null,
  });
  actions.clearTransferState();
  sendJsonMessage({
    type: "userClose",
    userId: recipientId!,
    role: "receiver",
    reason: "Sender canceled the connection. Closing receiver.",
  } satisfies UserCloseRequest);
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
      isTransferring: true,
      isTransferCanceled: false,
      isTransferError: false,
      isTransferCompleted: false,
    });
    actions.clearTransferState();
    actions.setFileTransferInfo({
      totalSize: msg.totalSize,
      totalChunks: msg.totalChunks,
    });
  }

  actions.setTransferStatus({
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

  if (!fileMetadata || !senderId) return;

  if (isTransferCanceled || isTransferCompleted) return;

  const isChunkIndexConsistent = msg.lastChunkIndex === chunkIndex + 1;
  const isUploadedSizeConsistent = msg.uploadedSize === receivedBytes;
  if (!isChunkIndexConsistent || !isUploadedSizeConsistent) {
    console.error("[Receiver] Inconsistent transfer data:", {
      lastChunkIndexFromSender: msg.lastChunkIndex,
      currentChunkIndex: chunkIndex + 1,
      uploadedSizeFromSender: msg.uploadedSize,
      receivedBytesFromClient: receivedBytes,
    });
    actions.setErrorMessage(
      "Transfer data is inconsistent. Please ask the sender to restart the transfer.",
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
      isTransferring: false,
      isTransferError: true,
      isTransferCanceled: false,
      isTransferCompleted: false,
    });
    return;
  }

  actions.setTransferStatus({ chunkIndex: msg.lastChunkIndex });
  // Finalize the file transfer by reconstructing the file from received chunks,
  actions.finalizeTransfer();

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

  actions.setTransferStatus({
    isTransferError: false,
    isTransferCanceled: false,
    isTransferCompleted: false,
  });
  actions.clearTransferState();
  actions.setErrorMessage("Sender restarted the transfer.");
}

// Process incoming 'cancelSenderTransfer' message
interface ProcessCancelSenderTransferMessageDeps {
  actions: FileReceiverActions;
}
function processCancelSenderTransferMessage(
  _msg: CancelSenderTransferResponse,
  deps: ProcessCancelSenderTransferMessageDeps,
) {
  const { actions } = deps;
  actions.setTransferStatus({
    isTransferring: false,
    isTransferError: false,
    isTransferCanceled: true,
    isTransferCompleted: false,
  });
  actions.setErrorMessage("Sender canceled the transfer");
}

// Process incoming 'peerDisconnected' message
interface ProcessPeerDisconnectedMessageDeps {
  actions: FileReceiverActions;
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
  transferConnection: TransferConnection;
}
export function processPeerDisconnectedMessage(
  msg: PeerDisconnectedResponse,
  deps: ProcessPeerDisconnectedMessageDeps,
) {
  const { actions, sendJsonMessage, transferConnection } = deps;
  const { recipientId } = transferConnection;

  const errorMsg = `Sender [${msg.peerId}] disconnected unexpectedly`;
  sendJsonMessage({
    type: "userClose",
    userId: recipientId!,
    role: "receiver",
    reason: errorMsg,
  } satisfies UserCloseRequest);

  actions.setErrorMessage(errorMsg);
  actions.setTransferConnection({ isConnected: false, recipientId: null });
  actions.setTransferStatus({
    isTransferring: false,
    isTransferError: true,
    isTransferCanceled: false,
    isTransferCompleted: false,
  });
  actions.clearTransferState();
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
