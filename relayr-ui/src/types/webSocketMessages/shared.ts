// ====================================================
// 🟦 Shared Types
// ====================================================

// Acknowledgement request type for the sender (to notify when the recipient is ready)
export type SenderAckRequestType = "recipientReady" | "uploadOutOfSync";

// Status for file transfer acknowledgment from the recipient
export type FileTransferAckStatus = "acknowledged" | "completed" | "error";

// Error response structure
export interface ErrorMessageResponse {
  success: false;
  message: string;
  details?: string;
  timestamp: string;
}

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
