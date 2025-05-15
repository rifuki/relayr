export * from "./sender";
export * from "./receiver";
export * from "./shared";

import { ErrorMessageResponse, RegisterResponse } from "./shared";

import {
  RecipientReadyResponse,
  CancelRecipientReadyResponse,
  FileTransferAckResponse,
} from "./sender";

import {
  CancelSenderReadyResponse,
  CancelSenderTransfer,
  FileChunkResponse,
  FileEndResponse,
  RestartTransferResponse,
  SenderAckResponse,
} from "./receiver";

export type WebSocketSenderTextMessageResponse =
  | ErrorMessageResponse
  | RegisterResponse
  | RecipientReadyResponse
  | CancelRecipientReadyResponse
  | FileTransferAckResponse;

export type WebSocketReceiverTextMessageResponse =
  | ErrorMessageResponse
  | RegisterResponse
  | CancelSenderReadyResponse
  | SenderAckResponse
  | FileChunkResponse
  | FileEndResponse
  | RestartTransferResponse
  | CancelSenderTransfer;
