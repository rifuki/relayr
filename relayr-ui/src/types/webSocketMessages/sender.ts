import {
  AckStatus,
  fileTransferAckStatus,
  SenderAckRequestType,
} from "./shared";

// ====================================================
// 🟥 Sender Section
// ====================================================

// Sender Requests
export interface FileMetaRequest {
  type: "fileMeta";
  senderId?: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface CancelSenderReadyRequest {
  type: "cancelSenderReady";
  senderId?: string;
}

export interface FileChunkRequest {
  type: "fileChunk";
  senderId?: string;
  fileName: string;
  totalSize: number;
  totalChunks: number;
  chunkIndex: number;
  chunkDataSize: number;
  uploadedSize: number;
  senderTransferProgress: number;
}

export interface FileEndRequest {
  type: "fileEnd";
  senderId?: string;
  fileName: string;
  totalSize: number;
  totalChunks: number;
  lastChunkIndex: number;
  uploadedSize: number;
}

export interface CancelSenderTransferRequest {
  type: "cancelSenderTransfer";
  senderId?: string;
}

export interface SenderAckRequest {
  type: "senderAck";
  requestType: SenderAckRequestType;
  recipientId: string;
  status: AckStatus;
  message?: string;
}

export interface RestartTransferRequest {
  type: "restartTransfer";
}

// Sender Responses
export interface RecipientReadyResponse {
  success: true;
  type: "recipientReady";
  recipientId: string;
  timestamp: number;
}

export interface CancelRecipientReadyResponse {
  success: true;
  type: "cancelRecipientReady";
  recipientId: string;
  timestamp: number;
}

export interface FileTransferAckResponse {
  success: true;
  type: "fileTransferAck";
  status: fileTransferAckStatus;
  fileName: string;
  totalChunks: number;
  chunkIndex: number;
  chunkDataSize: number;
  uploadedSize: number;
  recipientTransferProgress: number;
  timestamp: number;
}

export interface CancelRecipientTransferResponse {
  success: true;
  type: "cancelRecipientTransfer";
  recipientId: string;
  timestamp: number;
}
