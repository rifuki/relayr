// ====================================================
// 🟦 Shared Types
// ====================================================

// Acknowledgement request type for the sender (to notify when the recipient is ready)
export type SenderAckRequestType = "recipientReady";

// Acknowledgement status for transfer operations
export type AckStatus = "success" | "error";

// Status for file transfer acknowledgment
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
