// ====================================================
// 🟦 Shared Types
// ====================================================

// Acknowledgement request type for the sender (to notify when the recipient is ready)
export type SenderAckRequestType = "recipientReady" | "uploadOutOfSync";

// Status for file transfer acknowledgment from the recipient
export type FileTransferAckStatus = "acknowledged" | "completed" | "error";

export type ErrorCode =
  | "invalidPayload"
  | "senderAlreadyConnected"
  | "senderDisconnected"
  | "recipientDisconnected"
  | "activeConnectionNotFound"
  | "recipientMismatch"
  | "unsupportedWsMessageType"
  | "unsupportedWsMessageTextType"
  | "notHandledYet"
  | "unknown";

// Error response structure
export interface ErrorMessageResponse {
  success: false;
  code: ErrorCode;
  message: string;
  details?: string;
  timestamp: number;
}

export const errorCodeMessages: Record<ErrorCode, string> = {
  invalidPayload: "Invalid to parse websocket text message payload.",
  senderAlreadyConnected: "Sender is already connected to another recipient.",
  senderDisconnected: "Sender is no longer connected.",
  recipientDisconnected: "Recipient is no longer connected.",
  activeConnectionNotFound: "No active connection found. Please try again.",
  recipientMismatch: "Recipient ID mismatch. Please check your link.",
  unsupportedWsMessageTextType: "Unsupported websocket text message.",
  unsupportedWsMessageType: "Unknown message type received.",
  notHandledYet: "This feature is not implemented yet.",
  unknown: "Websocket text message type is unknown.",
};

// Register response structure for successful connection registration
export interface RegisterResponse {
  success: true;
  type: "register";
  connId: string;
  timestamp: number;
}

// User close request structure for notifying the server about user-initiated closure
export interface UserCloseRequest {
  type: "userClose";
  userId: string;
  role: "sender" | "receiver";
  reason: string;
}

export interface PeerDisconnectedResponse {
  success: true;
  type: "peerDisconnected";
  peerId: string;
  role: "sender" | "receiver";
  timestamp: number;
}
