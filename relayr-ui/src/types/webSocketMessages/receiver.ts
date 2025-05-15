import {
  AckStatus,
  fileTransferAckStatus,
  SenderAckRequestType,
} from "./shared";

// ====================================================
// 🟩 Receiver Section
// ====================================================

// Receiver Requests
export interface RecipientReadyPayload {
  type: "recipientReady";
  senderId: string;
  recipientId?: string;
}

export interface CancelRecipientReadyPayload {
  type: "cancelRecipientReady";
  senderId: string;
  recipientId?: string;
}

export interface FileTransferAckPayload {
  type: "fileTransferAck";
  senderId: string;
  status: fileTransferAckStatus;
  fileName: string;
  totalChunks: number;
  chunkIndex: number;
  chunkDataSize: number;
  uploadedSize: number;
  recipientTransferProgress: number;
}

// Receiver Responses
export interface CancelSenderReadyResponse {
  success: true;
  type: "cancelSenderReady";
  recipientId: string;
  timestamp: number;
}

export interface SenderAckResponse {
  success: true;
  type: "senderAck";
  requestType: SenderAckRequestType;
  senderId: string;
  status: AckStatus;
  message?: string;
  timestamp: number;
}

export interface FileChunkResponse {
  success: true;
  type: "fileChunk";
  senderId: string;
  fileName: string;
  totalSize: number;
  totalChunks: number;
  chunkIndex: number;
  chunkDataSize: number;
  uploadedSize: number;
  senderTransferProgress: number;
  timestamp: number;
}

export interface FileEndResponse {
  success: true;
  type: "fileEnd";
  fileName: string;
  totalSize: number;
  totalChunks: number;
  lastChunkIndex: number;
  uploadedSize: number;
  timestamp: number;
}

export interface RestartTransferResponse {
  success: true;
  type: "restartTransfer";
  senderId: string;
  timestamp: number;
}

export interface CancelSenderTransfer {
  success: true;
  type: "cancelSenderTransfer";
  senderId: string;
  timestamp: number;
}
