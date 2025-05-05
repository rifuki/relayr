export interface FileMetaRequest {
  type: "fileMeta";
  senderId?: string;
  fileName: string;
  fileSize: number;
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
  totalChunks: number;
  totalSize: number;
  chunkIndex: number;
  uploadedSize: number;
  chunkDataSize: number;
  transferProgress: number;
}

export interface FileEndRequest {
  type: "fileEnd";
  senderId?: string;
  fileName: string;
  totalChunks: number;
  totalSize: number;
  chunkIndex: number;
  uploadedSize: number;
}

//export type WebSocketMessageRequest = FileMetaRequest | FileChunkRequest;

export interface ErrorMessageResponse {
  success: false;
  message: string;
  details?: string;
}

export interface RegisterResponse {
  success: true;
  type: "register";
  connId: string;
  timestamp: number;
}

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

export interface AckResponse {
  success: true;
  type: "ack";
  status: "acknowledged" | "completed";
  fileName: string;
  totalChunks: number;
  chunkIndex: number;
  chunkDataSize?: number;
  uploadedSize: number;
  transferProgress?: number;
}

export type WebSocketMessageResponse =
  | ErrorMessageResponse
  | RegisterResponse
  | RecipientReadyResponse
  | CancelRecipientReadyResponse
  | AckResponse;
