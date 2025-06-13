export * from "./sender";
export * from "./shared";
export * from "./receiver";

// Import specific responses from shared, sender, and receiver
import {
  ErrorMessageResponse,
  PeerDisconnectedResponse,
  RegisterResponse,
} from "./shared";
import {
  RecipientReadyResponse,
  CancelRecipientReadyResponse,
  FileTransferAckResponse,
  CancelRecipientTransferResponse,
} from "./sender";
import {
  CancelSenderReadyResponse,
  CancelSenderTransferResponse,
  FileChunkResponse,
  FileEndResponse,
  RestartTransferResponse,
  SenderAckResponse,
} from "./receiver";

// Define WebSocket sender message types
export type WebSocketSenderTextMessageResponse =
  | ErrorMessageResponse
  | RegisterResponse
  | PeerDisconnectedResponse
  | RecipientReadyResponse
  | CancelRecipientReadyResponse
  | FileTransferAckResponse
  | CancelRecipientTransferResponse;

// Define WebSocket receiver message types
export type WebSocketReceiverTextMessageResponse =
  | ErrorMessageResponse
  | RegisterResponse
  | PeerDisconnectedResponse
  | CancelSenderReadyResponse
  | SenderAckResponse
  | FileChunkResponse
  | FileEndResponse
  | RestartTransferResponse
  | CancelSenderTransferResponse;
