// External Libraries
import { create } from "zustand";

// Types
import { FileMetadata } from "@/types/file";

// Helper Functions
import {
  SendNextChunkHandlers,
  sendNextChunk as sendNextChunkHelper,
} from "@/lib/send-next-chunk";

// Interfaces for Transfer Connection, File Transfer Info, Transfer Status, and Progress
export interface TransferConnection {
  senderId: string | null;
  recipientId: string | null;
}

interface FileTransferInfo {
  totalChunks: number;
}

export interface TransferStatus {
  uploadedSize: number;
  offset: number;
  chunkIndex: number;
  chunkDataSize: number;
  isTransferring: boolean;
  isTransferError: boolean;
  isTransferCanceled: boolean;
  isTransferCompleted: boolean;
}

export interface TransferProgress {
  sender: number;
  receiver: number;
}

interface LastTransferInfo {
  recipientId: string | null;
  transferShareLink: string | null;
}

// FileSender Actions Interface: Actions interface for modifying the store
export interface FileSenderActions {
  setInitId: (id: string) => void;
  setFile: (file: File | null) => void;
  setTransferConnection: (connection: Partial<TransferConnection>) => void;
  setErrorMessage: (message: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setTransferShareLink: (link: string | null) => void;
  setFileTransferInfo: (fileTransferInfo: Partial<FileTransferInfo>) => void;
  setTransferStatus: (transferStatus: Partial<TransferStatus>) => void;
  setTransferProgress: (transferProgress: Partial<TransferProgress>) => void;
  sendNextChunk: (sendNextChunkHandlers: SendNextChunkHandlers) => void;
  clearTransferState: () => void;
  setLastTransferInfo: (lastTransferInfo: LastTransferInfo) => void;
}

// FileSender State Interface
export interface FileSenderState {
  initId: string | null;
  file: File | null;
  fileMetadata: FileMetadata | null;
  transferConnection: TransferConnection;
  errorMessage: string | null;
  isLoading: boolean;
  transferShareLink: string | null;
  fileTransferInfo: FileTransferInfo;
  transferStatus: TransferStatus;
  transferProgress: TransferProgress;
  lastTransferInfo: LastTransferInfo;
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
  lastTransferInfo: {
    recipientId: null,
    transferShareLink: null,
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

      // If transfer is completed, update lastTransferInfo
      if (
        transferStatus.isTransferCompleted &&
        !get().transferStatus.isTransferCompleted
      ) {
        const { recipientId } = get().transferConnection;
        const { transferShareLink } = get();

        set({
          transferStatus: {
            ...get().transferStatus,
            isTransferring: false,
            isTransferError: false,
            isTransferCanceled: false,
            isTransferCompleted: true,
          },
          lastTransferInfo: {
            recipientId,
            transferShareLink,
          },
        });
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
    sendNextChunk: (handlers) => {
      if (get().transferStatus.isTransferCanceled) return;
      sendNextChunkHelper({ get, set }, handlers);
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
        },
        transferProgress: {
          sender: 0,
          receiver: 0,
        },
      }),
    setLastTransferInfo: (lastTransferInfo) => set({ lastTransferInfo }),
  },
}));

// Custom Hooks for accessing store and actions
export const useFileSenderActions = () =>
  useFileSenderStore((state) => state.actions);
