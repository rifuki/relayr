import { create } from "zustand";
import { WebSocketLike } from "react-use-websocket/dist/lib/types";

import { FileMetadata } from "@/types/file";

interface WebSocketHandlers {
  sendJsonMessage: ((msg: unknown) => void) | undefined;
  getWebSocket: (() => WebSocketLike | null) | undefined;
}

interface FileReceiverActions {
  setInitId: (id: string) => void;
  setSenderId: (senderId: string | null) => void;
  setRecipientId: (recipientId: string | null) => void;
  setFileMetadata: (fileMetadata: FileMetadata) => void;
  setErrorMessage: (message: string | null) => void;
  setWebSocketUrl: (wsUrl: string | null) => void;
  setWebSocketHandlers: (handlers: Partial<WebSocketHandlers>) => void;
  setIsConnectedToSender: (isConnectedToSender: boolean) => void;
  setIsSenderTransferring: (isSenderTransferring: boolean) => void;

  setTotalSize: (totalSize: number) => void;
  setTotalChunks: (totalChunks: number) => void;
  setChunkIndex: (chunkIndex: number) => void;
  setChunkDataSize: (chunkDataSize: number) => void;
  setUploadedSize: (uploadedSize: number) => void;
  setSenderTransferProgress: (senderTransferProgress: number) => void;
  resetTransferStatus: () => void;

  setReceivedChunkData: (receivedChunkData: ArrayBuffer) => void;
  setReceivedBytes: (receivedBytes: number) => void;
  setReceiverTransferProgress: (receiverTransferProgress: number) => void;
  setIsTransferCompleted: (isTransferCompleted: boolean) => void;
  setIsTransferError: (isTransferError: boolean) => void;
}

interface FileReceiverState {
  initId: string | null;
  senderId: string | null;
  recipientId: string | null;
  fileMetadata: FileMetadata | null;
  errorMessage: string | null;
  webSocketUrl: string | null;
  wsHandlers: WebSocketHandlers;
  isConnectedToSender: boolean;
  isSenderTransferring: boolean;
  totalSize: number;
  totalChunks: number;
  chunkIndex: number;
  chunkDataSize: number;
  uploadedSize: number;
  senderTransferProgress: number;
  receivedChunkData: ArrayBuffer[];
  receivedBytes: number;
  receiverTransferProgress: number;
  isTransferCompleted: boolean;
  isTransferError: boolean;
  actions: FileReceiverActions;
}

export const useFileReceiverStore = create<FileReceiverState>()((set) => ({
  initId: null,
  senderId: null,
  recipientId: null,
  fileMetadata: null,
  errorMessage: null,
  webSocketUrl: null,
  wsHandlers: {
    sendJsonMessage: undefined,
    getWebSocket: undefined,
  },
  isConnectedToSender: false,
  isSenderTransferring: false,
  totalSize: 0,
  totalChunks: 0,
  chunkIndex: 0,
  chunkDataSize: 0,
  uploadedSize: 0,
  senderTransferProgress: 0,
  receivedChunkData: [],
  receivedBytes: 0,
  receiverTransferProgress: 0,
  isTransferCompleted: false,
  isTransferError: false,
  actions: {
    setInitId: (id) => set({ initId: id }),
    setSenderId: (senderId) => set({ senderId }),
    setRecipientId: (recipientId) => set({ recipientId }),
    setFileMetadata: (fileMetadata) =>
      set({
        fileMetadata,
      }),
    setErrorMessage: (message) => set({ errorMessage: message }),
    setWebSocketUrl: (wsUrl) => set({ webSocketUrl: wsUrl }),
    setWebSocketHandlers: (handlers) =>
      set((state) => ({
        wsHandlers: { ...state.wsHandlers, ...handlers },
      })),
    setIsConnectedToSender: (isConnectedToSender) =>
      set({ isConnectedToSender }),
    setIsSenderTransferring: (isSenderTransferring) =>
      set({ isSenderTransferring }),

    setTotalSize: (totalSize: number) => set({ totalSize }),
    setTotalChunks: (totalChunks: number) => set({ totalChunks }),
    setChunkIndex: (chunkIndex: number) => set({ chunkIndex }),
    setChunkDataSize: (chunkDataSize: number) => set({ chunkDataSize }),
    setUploadedSize: (uploadedSize: number) => set({ uploadedSize }),
    setSenderTransferProgress: (senderTransferProgress: number) =>
      set({ senderTransferProgress }),
    resetTransferStatus: () =>
      set({
        isSenderTransferring: false,
        totalSize: 0,
        totalChunks: 0,
        chunkIndex: 0,
        chunkDataSize: 0,
        uploadedSize: 0,
        senderTransferProgress: 0,
        receivedChunkData: [],
        receivedBytes: 0,
        receiverTransferProgress: 0,
      }),

    setReceivedChunkData: (receivedChunkData: ArrayBuffer) =>
      set((state) => ({
        receivedChunkData: state.receivedChunkData.concat(receivedChunkData),
      })),
    setReceivedBytes: (receivedBytes: number) =>
      set({
        receivedBytes,
      }),
    setReceiverTransferProgress: (receiverTransferProgress: number) =>
      set({
        receiverTransferProgress,
      }),
    setIsTransferCompleted: (isTransferCompleted) =>
      set({ isTransferCompleted }),
    setIsTransferError: (isTransferError) => set({ isTransferError }),
  },
}));

export const useFileReceiverActions = () =>
  useFileReceiverStore((state) => state.actions);
