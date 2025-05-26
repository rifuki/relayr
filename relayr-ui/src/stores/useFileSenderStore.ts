import { create } from "zustand";
import { WebSocketLike } from "react-use-websocket/dist/lib/types";

import { FileMetadata } from "@/types/file";
import { sendNextChunk as sendNextChunkHelper } from "@/lib/sendNextChunk";

interface FileTransferConnection {
  senderId: string | null;
  recipientId: string | null;
}

interface FileTransferStatus {
  totalChunks: number;
  chunkDataSize: number;
  offset: number;
  chunkIndex: number;
  senderProgress: number;
  receiverProgress: number;
  uploadedSize: number;
  totalSize: number;
  isTransferring: boolean;
  isSenderComplete: boolean;
  isRecipientComplete: boolean;
  isError: boolean;
  isCanceled: boolean;
}

interface WebSocketHandlers {
  sendJsonMessage: ((msg: unknown) => void) | undefined;
  sendMessage: ((msg: string | ArrayBuffer | Blob) => void) | undefined;
  getWebSocket: (() => WebSocketLike | null) | undefined;
}

interface FileSenderActions {
  setInitId: (id: string) => void;
  setFile: (file: File | null) => void;
  setErrorMessage: (message: string | null) => void;
  setWebSocketUrl: (wsUrl: string | null) => void;
  setTransferConnection: (connection: Partial<FileTransferConnection>) => void;
  setIsLoading: (isLoading: boolean) => void;
  setTransferShareLink: (link: string | null) => void;
  setWebSocketHandlers: (handlers: Partial<WebSocketHandlers>) => void;
  setTransferStatus: (transferStatus: Partial<FileTransferStatus>) => void;
  sendNextChunk: () => void;
  resetTransferStatus: () => void;
  setHasReset: (value: boolean) => void;
}

export interface FileSenderState {
  initId: string | null;
  file: File | null;
  fileMetadata: FileMetadata | null;
  errorMessage: string | null;
  webSocketUrl: string | null;
  transferConnection: FileTransferConnection;
  isLoading: boolean;
  transferShareLink: string | null;
  transferStatus: FileTransferStatus;
  wsHandlers: WebSocketHandlers;
  hasReset: boolean;
  actions: FileSenderActions;
}

export const useFileSenderStore = create<FileSenderState>()((set, get) => ({
  initId: null,
  file: null,
  fileMetadata: null,
  errorMessage: null,
  webSocketUrl: null,
  transferConnection: {
    senderId: null,
    recipientId: null,
  },
  isLoading: false,
  transferShareLink: null,
  transferStatus: {
    totalChunks: 0,
    chunkDataSize: 0,
    offset: 0,
    chunkIndex: 0,
    senderProgress: 0,
    receiverProgress: 0,
    uploadedSize: 0,
    totalSize: 0,
    isTransferring: false,
    isSenderComplete: false,
    isRecipientComplete: false,
    isError: false,
    isCanceled: false,
  },
  wsHandlers: {
    sendJsonMessage: undefined,
    sendMessage: undefined,
    getWebSocket: undefined,
  },
  hasReset: false,
  actions: {
    setInitId: (id) => set({ initId: id }),
    setFile: (file) =>
      set(() => ({
        file,
        fileMetadata: file
          ? { name: file.name, size: file.size, type: file.type }
          : null,
      })),
    setErrorMessage: (message) => set({ errorMessage: message }),
    setWebSocketUrl: (wsUrl) => set({ webSocketUrl: wsUrl }),
    setTransferConnection: (connection) =>
      set((state) => ({
        transferConnection: {
          ...state.transferConnection,
          ...connection,
        },
      })),
    setIsLoading: (isLoading) => set({ isLoading }),
    setTransferShareLink: (link) => set({ transferShareLink: link }),
    setWebSocketHandlers: (handlers) =>
      set((state) => ({
        wsHandlers: {
          ...state.wsHandlers,
          ...handlers,
        },
      })),
    setTransferStatus: (transferStatus) =>
      set((state) => ({
        transferStatus: {
          ...state.transferStatus,
          ...transferStatus,
        },
      })),
    sendNextChunk: () => sendNextChunkHelper({ get, set }),
    resetTransferStatus: () =>
      set({
        transferStatus: {
          totalChunks: 0,
          chunkDataSize: 0,
          offset: 0,
          chunkIndex: 0,
          senderProgress: 0,
          receiverProgress: 0,
          uploadedSize: 0,
          totalSize: 0,
          isTransferring: false,
          isSenderComplete: false,
          isRecipientComplete: false,
          isError: false,
          isCanceled: false,
        },
      }),
    setHasReset: (value) => set({ hasReset: value }),
  },
}));

export const useFileSenderActions = () =>
  useFileSenderStore((state) => state.actions);

export const useWebSocketHandlers = () =>
  useFileSenderStore((state) => state.wsHandlers);
