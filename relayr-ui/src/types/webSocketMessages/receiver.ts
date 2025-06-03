import {
  AckStatus,
  FileTransferAckStatus,
  SenderAckRequestType,
} from "./shared";

// ====================================================
// 🟩 Receiver Section
// ====================================================

// Receiver Requests

// Request to notify that the recipient is ready to receive the file
export interface RecipientReadyRequest {
  type: "recipientReady";
  senderId: string; // ID of the sender
  recipientId?: string; // Optional recipient ID
}

// Request to cancel the recipient's readiness
export interface CancelRecipientReadyRequest {
  type: "cancelRecipientReady";
  senderId: string; // ID of the sender
  recipientId?: string; // Optional recipient ID
}

// Request for acknowledgment from the recipient about file transfer status
export interface FileTransferAckRequest {
  type: "fileTransferAck";
  senderId: string; // ID of the sender
  status: FileTransferAckStatus; // Status of file transfer acknowledgment
  fileName: string; // File name
  totalChunks: number; // Total number of chunks in the file
  uploadedSize: number; // Size of the uploaded data so far
  chunkIndex: number; // Index of the current chunk
  chunkDataSize: number; // Size of the current chunk
  recipientTransferProgress: number; // Progress of the transfer at the recipient's end
}

// Request to cancel an ongoing file transfer by the recipient
export interface CancelRecipientTransferRequest {
  type: "cancelRecipientTransfer";
  senderId: string; // ID of the sender
  recipientId?: string; // Optional recipient ID
}

// Receiver Responses

// Response indicating that the sender's readiness has been canceled
export interface CancelSenderReadyResponse {
  success: true; // Operation was successful
  type: "cancelSenderReady"; // Type of response
  recipientId: string; // Recipient's ID
  timestamp: number; // Timestamp of the response
}

// Response for sender acknowledgment
export interface SenderAckResponse {
  success: true; // Operation was successful
  type: "senderAck"; // Type of response
  requestType: SenderAckRequestType; // Type of acknowledgment request
  senderId: string; // ID of the sender
  status: AckStatus; // Acknowledgment status (success/error)
  message?: string; // Optional message
  timestamp: number; // Timestamp of the response
}

// Response containing file chunk information sent by the sender
export interface FileChunkResponse {
  success: true; // Operation was successful
  type: "fileChunk"; // Type of response
  senderId: string; // ID of the sender
  fileName: string; // File name
  totalSize: number; // Total size of the file
  totalChunks: number; // Total number of chunks
  uploadedSize: number; // Size of the uploaded data so far
  chunkIndex: number; // Index of the current chunk
  chunkDataSize: number; // Size of the current chunk
  senderTransferProgress: number; // Sender's transfer progress
  timestamp: number; // Timestamp of the response
}

// Response indicating that the file transfer has been completed
export interface FileEndResponse {
  success: true; // Operation was successful
  type: "fileEnd"; // Type of response
  fileName: string; // File name
  totalSize: number; // Total file size
  totalChunks: number; // Total number of chunks
  uploadedSize: number; // Size uploaded so far
  lastChunkIndex: number; // Index of the last chunk
  timestamp: number; // Timestamp of the response
}

// Response indicating that the file transfer needs to be restarted
export interface RestartTransferResponse {
  success: true; // Operation was successful
  type: "restartTransfer"; // Type of response
  senderId: string; // ID of the sender
  timestamp: number; // Timestamp of the response
}

// Response indicating that the recipient's transfer has been canceled
export interface CancelSenderTransferResponse {
  success: true;
  type: "cancelSenderTransfer";
  senderId: string;
  timestamp: number;
}
