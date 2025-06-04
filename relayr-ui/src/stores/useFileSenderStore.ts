// External Libraries
import { WebSocketLike } from "react-use-websocket/dist/lib/types";
import { create } from "zustand";

// Types
import { FileMetadata } from "@/types/file";

// Helper Functions
import { sendNextChunk as sendNextChunkHelper } from "@/lib/send-next-chunk";

// Interfaces for Transfer Connection, File Transfer Info, Transfer Status, and Progress
interface TransferConnection {
  senderId: string | null;
  recipientId: string | null;
}

interface FileTransferInfo {
  totalChunks: number;
}

interface TransferStatus {
  uploadedSize: number;
  offset: number;
  chunkIndex: number;
  chunkDataSize: number;
  isTransferring: boolean;
  isTransferError: boolean;
  isTransferCanceled: boolean;
  isTransferCompleted: boolean;
}

interface TransferProgress {
  sender: number;
  receiver: number;
}

// WebSocket Handlers Interface: Contains functions for sending messages and getting WebSocket instance
interface WebSocketHandlers {
  sendJsonMessage: ((msg: unknown) => void) | undefined;
  sendMessage: ((msg: string | ArrayBuffer | Blob) => void) | undefined;
  getWebSocket: (() => WebSocketLike | null) | undefined;
}

// FileSender Actions Interface: Actions interface for modifying the store
interface FileSenderActions {
  setInitId: (id: string) => void;
  setFile: (file: File | null) => void;
  setTransferConnection: (connection: Partial<TransferConnection>) => void;
  setErrorMessage: (message: string | null) => void;
  setWebSocketUrl: (wsUrl: string | null) => void;
  setWebSocketReadyState: (readyState: number) => void;
  setWebSocketHandlers: (webSocketHandlers: Partial<WebSocketHandlers>) => void;
  setIsLoading: (isLoading: boolean) => void;
  setTransferShareLink: (link: string | null) => void;
  setFileTransferInfo: (fileTransferInfo: Partial<FileTransferInfo>) => void;
  setTransferStatus: (transferStatus: Partial<TransferStatus>) => void;
  setTransferProgress: (transferProgress: Partial<TransferProgress>) => void;
  sendNextChunk: () => void;
  clearTransferState: () => void;
}

// FileSender State Interface
export interface FileSenderState {
  initId: string | null;
  file: File | null;
  fileMetadata: FileMetadata | null;
  transferConnection: TransferConnection;
  errorMessage: string | null;
  webSocketUrl: string | null;
  webSocketReadyState: number;
  webSocketHandlers: WebSocketHandlers;
  isLoading: boolean;
  transferShareLink: string | null;
  fileTransferInfo: FileTransferInfo;
  transferStatus: TransferStatus;
  transferProgress: TransferProgress;
  actions: FileSenderActions;
}

// Zustand Store for File Sender
export const useFileSenderStore = create<FileSenderState>()((set, get) => ({
  initId: null,
  file: null,
  fileMetadata: null,
  transferConnection: {
    senderId: null,
    recipientId: null,
  },
  errorMessage: null,
  webSocketUrl: null,
  webSocketReadyState: -1,
  webSocketHandlers: {
    sendJsonMessage: undefined,
    sendMessage: undefined,
    getWebSocket: undefined,
  },
  isLoading: false,
  transferShareLink: null,
  fileTransferInfo: {
    totalChunks: 0,
  },
  transferStatus: {
    uploadedSize: 0,
    offset: 0,
    chunkIndex: 0,
    chunkDataSize: 0,
    isTransferring: false,
    isTransferError: false,
    isTransferCanceled: false,
    isTransferCompleted: false,
  },
  transferProgress: {
    sender: 0,
    receiver: 0,
  },
  actions: {
    setInitId: (id) => set({ initId: id }),
    setFile: (file) =>
      set({
        file,
        fileMetadata: file
          ? { name: file.name, size: file.size, type: file.type }
          : null,
      }),
    setTransferConnection: (transferConnection) =>
      set({
        transferConnection: {
          ...get().transferConnection,
          ...transferConnection,
        },
      }),
    setErrorMessage: (errorMessage) => set({ errorMessage }),
    setWebSocketUrl: (webSocketUrl) => set({ webSocketUrl }),
    setWebSocketHandlers: (webSocketHandlers) =>
      set({
        webSocketHandlers: { ...get().webSocketHandlers, ...webSocketHandlers },
      }),
    setWebSocketReadyState: (readyState) =>
      set({ webSocketReadyState: readyState }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setTransferShareLink: (link) => set({ transferShareLink: link }),
    setFileTransferInfo: (fileTransferInfo) => {
      if (get().transferStatus.isTransferCanceled) return; // Don't set if transfer is canceled

      set({
        fileTransferInfo: {
          ...get().fileTransferInfo,
          ...fileTransferInfo,
        },
      });
    },
    setTransferStatus: (transferStatus) => {
      // Prevent status update if the transfer is canceled
      if (
        get().transferStatus.isTransferCanceled &&
        transferStatus.isTransferCanceled !== false
      )
        return;

      if (transferStatus.isTransferCanceled) {
        set({
          transferStatus: {
            ...get().transferStatus,
            ...transferStatus,
          },
        });
        get().actions.clearTransferState(); // Clear transfer state if canceled
        return;
      }

      set({
        transferStatus: {
          ...get().transferStatus,
          ...transferStatus,
        },
      });
    },
    setTransferProgress: (transferProgress) => {
      if (get().transferStatus.isTransferCanceled) return; // Don't set if transfer is canceled

      set({
        transferProgress: {
          ...get().transferProgress,
          ...transferProgress,
        },
      });
    },
    sendNextChunk: () => {
      if (get().transferStatus.isTransferCanceled) return;
      sendNextChunkHelper({ get, set });
    },
    clearTransferState: () =>
      set({
        fileTransferInfo: {
          totalChunks: 0,
        },
        transferStatus: {
          ...get().transferStatus,
          uploadedSize: 0,
          offset: 0,
          chunkIndex: 0,
          chunkDataSize: 0,
          isTransferring: false,
          isTransferCompleted: false,
        },
        transferProgress: {
          sender: 0,
          receiver: 0,
        },
      }),
  },
}));

// Custom Hooks for accessing store and actions
export const useFileSenderActions = () =>
  useFileSenderStore((state) => state.actions);

export const useSenderWebSocketHandlers = () =>
  useFileSenderStore((state) => state.webSocketHandlers);
