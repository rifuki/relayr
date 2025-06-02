import {
  AckStatus,
  FileTransferAckStatus,
  SenderAckRequestType,
} from "./shared";

// ====================================================
// 🟥 Sender Section
// ====================================================

// Sender Requests

// Request for file metadata from the sender
export interface FileMetaRequest {
  type: "fileMeta";
  senderId?: string;
  name: string;
  size: number;
  mimeType: string;
}

// Request to cancel the sender's readiness
export interface CancelSenderReadyRequest {
  type: "cancelSenderReady";
  senderId?: string;
}

// Request for a chunk of the file to be transferred
export interface FileChunkRequest {
  type: "fileChunk";
  senderId?: string;
  fileName: string;
  totalSize: number;
  totalChunks: number;
  uploadedSize: number;
  chunkIndex: number;
  chunkDataSize: number;
  senderTransferProgress: number;
}

// Request to mark the file transfer as completed
export interface FileEndRequest {
  type: "fileEnd";
  senderId?: string;
  fileName: string;
  totalSize: number;
  totalChunks: number;
  uploadedSize: number;
  lastChunkIndex: number;
}

// Request to cancel an ongoing sender transfer
export interface CancelSenderTransferRequest {
  type: "cancelSenderTransfer";
  senderId?: string;
}

// Acknowledgment request from the sender
export interface SenderAckRequest {
  type: "senderAck";
  requestType: SenderAckRequestType;
  recipientId: string;
  status: AckStatus;
  message?: string;
}

// Request to restart the file transfer
export interface RestartTransferRequest {
  type: "restartTransfer";
}

// Sender Responses

// Response to confirm the recipient is ready to receive the file
export interface RecipientReadyResponse {
  success: true;
  type: "recipientReady";
  recipientId: string;
  timestamp: number;
}

// Response to cancel recipient readiness
export interface CancelRecipientReadyResponse {
  success: true;
  type: "cancelRecipientReady";
  recipientId: string;
  timestamp: number;
}

// Acknowledgment response for file transfer
export interface FileTransferAckResponse {
  success: true;
  type: "fileTransferAck";
  status: FileTransferAckStatus;
  fileName: string;
  totalChunks: number;
  uploadedSize: number;
  chunkIndex: number;
  chunkDataSize: number;
  recipientTransferProgress: number;
  timestamp: number;
}

// Response to cancel the recipient's transfer
export interface CancelRecipientTransferResponse {
  success: true;
  type: "cancelRecipientTransfer";
  recipientId: string;
  timestamp: number;
}
