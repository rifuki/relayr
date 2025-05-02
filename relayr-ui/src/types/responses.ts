export interface RegisterResponse {
  success: boolean;
  type: string;
  connId: string;
  timestamp: number;
}

export interface RecipientReadyResponse {
  success: boolean;
  type: string;
  recipientId: string;
  timestamp: number;
}

export interface FileMetaResponse {
  success: boolean;
  type: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface CancelRecipientReadyResponse {
  success: boolean;
  type: string;
  recipientId: string;
  message: string;
  timestamp: string;
}
