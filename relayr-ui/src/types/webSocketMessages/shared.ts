// ====================================================
// 🟦 Shared Types
// ====================================================

export type SenderAckRequestType = "recipientReady";
export type AckStatus = "success" | "error";
export type fileTransferAckStatus = "acknowledged" | "completed" | "error";

export interface ErrorMessageResponse {
  success: false;
  message: string;
  details?: string;
  timestamp: string;
}

export interface RegisterResponse {
  success: true;
  type: "register";
  connId: string;
  timestamp: number;
}
