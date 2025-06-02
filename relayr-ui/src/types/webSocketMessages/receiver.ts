import {
  AckStatus,
  fileTransferAckStatus,
  SenderAckRequestType,
} from "./shared";

// ====================================================
// 🟩 Receiver Section
// ====================================================

// Receiver Requests
export interface RecipientReadyRequest {
  type: "recipientReady";
  senderId: string;
  recipientId?: string;
}

export interface CancelRecipientReadyRequest {
  type: "cancelRecipientReady";
  senderId: string;
  recipientId?: string;
}

export interface FileTransferAckRequest {
  type: "fileTransferAck";
  senderId: string;
  status: fileTransferAckStatus;
  fileName: string;
  totalChunks: number;
  uploadedSize: number;
  chunkIndex: number;
  chunkDataSize: number;
  recipientTransferProgress: number;
}

export interface CancelRecipientTransferRequest {
  type: "cancelRecipientTransfer";
  senderId: string;
  recipientId?: string;
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
  uploadedSize: number;
  chunkIndex: number;
  chunkDataSize: number;
  senderTransferProgress: number;
  timestamp: number;
}

export interface FileEndResponse {
  success: true;
  type: "fileEnd";
  fileName: string;
  totalSize: number;
  totalChunks: number;
  uploadedSize: number;
  lastChunkIndex: number;
  timestamp: number;
}

export interface RestartTransferResponse {
  success: true;
  type: "restartTransfer";
  senderId: string;
  timestamp: number;
}

export interface CancelSenderTransferResponse {
  success: true;
  type: "cancelSenderTransfer";
  senderId: string;
  timestamp: number;
}
