// External Libaries Types
import type { WebSocketHook } from "react-use-websocket/dist/lib/types";

// Types
import type {
  FileSenderActions,
  TransferConnection,
  TransferProgress,
  TransferStatus,
} from "@/stores/useFileSenderStore";
import type { FileMetadata } from "@/types/file";
import type {
  CancelRecipientReadyResponse,
  CancelRecipientTransferResponse,
  FileMetaRequest,
  FileTransferAckResponse,
  PeerDisconnectedResponse,
  RecipientReadyResponse,
  RegisterResponse,
  SenderAckRequest,
  UserCloseRequest,
  WebSocketSenderTextMessageResponse,
} from "@/types/webSocketMessages";

// WebSocket message processing functions
interface ProcessWebSocketTextMessageDeps {
  actions: FileSenderActions;
  file: File | null;
  fileMetadata: FileMetadata | null;
  transferConnection: TransferConnection;
  transferStatus: TransferStatus;
  transferProgress: TransferProgress;
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
  sendMessage: WebSocketHook["sendMessage"];
}
export function processWebSocketTextMessage(
  wsMsg: WebSocketSenderTextMessageResponse,
  deps: ProcessWebSocketTextMessageDeps,
) {
  const {
    actions,
    file,
    fileMetadata,
    transferConnection,
    transferStatus,
    transferProgress,
    sendJsonMessage,
    sendMessage,
  } = deps;

  if (!wsMsg.success) {
    actions.setTransferStatus({
      isTransferring: false,
      isTransferError: true,
      isTransferCanceled: false,
      isTransferCompleted: false,
    });
    actions.clearTransferState();
    if (wsMsg.message.includes("is no longer connected")) {
      actions.setErrorMessage(
        "Recipient is no longer connection. Please try again.",
      );
      actions.setTransferConnection({ recipientId: null });
    } else {
      actions.setErrorMessage(wsMsg.message ?? "Unknown error occurred");
    }
    return;
  }

  // Process specific WebSocket message types
  switch (wsMsg.type) {
    case "register":
      processRegisterMessage(wsMsg, {
        actions,
        fileMetadata,
        sendJsonMessage,
      });
      break;
    case "recipientReady":
      processRecipientReadyMessage(wsMsg, {
        actions,
        sendJsonMessage,
      });
      break;
    case "cancelRecipientReady":
      processCancelRecipientReadyMessage(wsMsg, {
        actions,
      });
      break;
    case "fileTransferAck":
      processFileTransferAckMessage(wsMsg, {
        actions,
        file,
        transferConnection,
        transferStatus,
        transferProgress,
        sendJsonMessage,
        sendMessage,
      });
      break;
    case "cancelRecipientTransfer":
      processCancelRecipientTransferMessage(wsMsg, { actions });
      break;

    case "peerDisconnected":
      processPeerDisconnectedMessage(wsMsg, { actions });
      break;
    default:
      console.error("[Sender] Unknown WebSocket message:", wsMsg);
      break;
  }
}

// Handle register message
interface ProcessRegisterMessageDeps {
  actions: FileSenderActions;
  fileMetadata: FileMetadata | null;
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
}
function processRegisterMessage(
  msg: RegisterResponse,
  deps: ProcessRegisterMessageDeps,
) {
  const { actions, fileMetadata, sendJsonMessage } = deps;

  if (!fileMetadata) {
    const errorMsg =
      "File metadata not available. Please refresh the page and try again.";
    actions.setErrorMessage(errorMsg);
    sendJsonMessage({
      type: "userClose",
      userId: msg.connId,
      role: "sender",
      reason: "File metadata not available. Closing connection.",
    } satisfies UserCloseRequest);

    return;
  }

  actions.setErrorMessage(null);
  actions.setTransferConnection({ senderId: msg.connId });
  actions.setTransferShareLink(
    `${window.location.origin}/transfer/receive?id=${msg.connId}`,
  );
  sendJsonMessage({
    type: "fileMeta",
    name: fileMetadata.name,
    size: fileMetadata.size,
    mimeType: fileMetadata.type,
  } satisfies FileMetaRequest);
  actions.setIsLoading(false);
}

// Handle recipient ready message
interface ProcessRecipientReadyMessageDeps {
  actions: FileSenderActions;
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
}
function processRecipientReadyMessage(
  msg: RecipientReadyResponse,
  deps: ProcessRecipientReadyMessageDeps,
) {
  const { actions, sendJsonMessage } = deps;

  actions.setErrorMessage(null);
  actions.setTransferConnection({ recipientId: msg.recipientId });
  sendJsonMessage({
    type: "senderAck",
    requestType: "recipientReady",
    recipientId: msg.recipientId,
  } satisfies SenderAckRequest);
  actions.setTransferStatus({
    isTransferring: false,
    isTransferError: false,
    isTransferCanceled: false,
    isTransferCompleted: false,
  });
  actions.clearTransferState();
}

// Handle cancel recipient ready message
interface ProcessCancelRecipientReadyMessageDeps {
  actions: FileSenderActions;
}
function processCancelRecipientReadyMessage(
  _msg: CancelRecipientReadyResponse,
  { actions }: ProcessCancelRecipientReadyMessageDeps,
) {
  actions.setTransferConnection({ recipientId: null });
  actions.setErrorMessage("Recipient canceled the transfer before it started");
}

// Handle file transfer acknowledgment message
interface ProcessFileTransferAckMessageDeps {
  actions: FileSenderActions;
  file: File | null;
  transferConnection: TransferConnection;
  transferStatus: TransferStatus;
  transferProgress: TransferProgress;
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
  sendMessage: WebSocketHook["sendMessage"];
}
function processFileTransferAckMessage(
  ack: FileTransferAckResponse,
  deps: ProcessFileTransferAckMessageDeps,
) {
  const {
    actions,
    file,
    transferConnection,
    transferStatus,
    transferProgress,
    sendJsonMessage,
    sendMessage,
  } = deps;

  const { senderId } = transferConnection;
  const {
    offset,
    chunkIndex,
    chunkDataSize,
    isTransferError,
    isTransferCanceled,
  } = transferStatus;
  const { sender: senderProgress } = transferProgress;

  if (!file || !senderId) {
    const errorMsg =
      "File or sender ID not available. Please refresh the page and try again.";
    actions.setErrorMessage(errorMsg);
    console.error(errorMsg);
    return;
  }
  if (isTransferCanceled || isTransferError) return;

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
      sendJsonMessage({
        type: "senderAck",
        requestType: "uploadOutOfSync",
        recipientId: ack.recipientId,
      } satisfies SenderAckRequest);
      return;
    }

    actions.setTransferStatus({
      offset: offset + chunkDataSize,
      chunkIndex: chunkIndex + 1,
    });
    actions.setTransferProgress({ receiver: ack.recipientTransferProgress });
    if (!isTransferCanceled || !isTransferError)
      actions.sendNextChunk({ sendJsonMessage, sendMessage });
  } else if (ack.status === "completed") {
    actions.setTransferStatus({
      isTransferring: false,
      isTransferError: false,
      isTransferCanceled: false,
      isTransferCompleted: true,
    });
    // Close the WebSocknnection gracefully after transfer completion
    sendJsonMessage({
      type: "userClose",
      userId: senderId,
      role: "sender",
      reason: `Transfer completed for file "${file.name}". Closing connection.`,
    } satisfies UserCloseRequest);
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
    const errorMsg = `Unknown ack status: ${ack.status}`;
    actions.setErrorMessage(errorMsg);
    console.error(errorMsg);
  }
}

// Handle cancel recipient transfer message
interface ProcessCancelRecipientTransferMessageDeps {
  actions: FileSenderActions;
}
function processCancelRecipientTransferMessage(
  msg: CancelRecipientTransferResponse,
  deps: ProcessCancelRecipientTransferMessageDeps,
) {
  const { actions } = deps;

  actions.setTransferStatus({
    isTransferring: false,
    isTransferError: false,
    isTransferCanceled: true,
    isTransferCompleted: false,
  });
  const errorMsg = `Recipient canceled the transfer`;
  actions.setErrorMessage(errorMsg);
}

interface ProcessPeerDisconnectedMessageDeps {
  actions: FileSenderActions;
}
function processPeerDisconnectedMessage(
  msg: PeerDisconnectedResponse,
  deps: ProcessPeerDisconnectedMessageDeps,
) {
  const { actions } = deps;

  actions.setErrorMessage(
    `Recipient [${msg.peerId}] disconnected unexpectedly`,
  );
  actions.setTransferConnection({ recipientId: null });
  actions.setTransferStatus({
    isTransferring: false,
    isTransferError: false,
    isTransferCanceled: false,
    isTransferCompleted: false,
  });
  actions.clearTransferState();
}
