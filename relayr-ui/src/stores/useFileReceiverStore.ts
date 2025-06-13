// External Libraries
import { create } from "zustand";

// Types
import { FileMetadata } from "@/types/file";

// Interfaces for Transfer Connection, File Transfer Info, Transfer Status, and Progress
export interface TransferConnection {
  senderId: string | null;
  recipientId: string | null;
  isConnected: boolean;
}

export interface FileTransferInfo {
  totalSize: number;
  totalChunks: number;
}

export interface TransferStatus {
  uploadedSize: number;
  receivedBytes: number;
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

// FileReceiver Actions Interface: Actions interface for modifying the store
export interface FileReceiverActions {
  setInitId: (id: string) => void;
  setTransferConnection: (
    transferConnection: Partial<TransferConnection>,
  ) => void;
  setFileMetadata: (fileMetadata: FileMetadata | null) => void;
  setErrorMessage: (errorMessage: string | null) => void;
  setFileTransferInfo: (fileTransferInfo: Partial<FileTransferInfo>) => void;
  setTransferStatus: (transferStatus: Partial<TransferStatus>) => void;
  setTransferProgress: (transferProgress: Partial<TransferProgress>) => void;
  setReceivedChunkData: (receivedChunkData: ArrayBuffer) => void;
  clearTransferState: () => void;
  finalizeTransfer: () => void;
  setIsReceiverFlowActive: (isReceiverFlowActive: boolean) => void;
  setLastValidSenderId: (senderId: string | null) => void;
}

// FileReceiver State Interface
interface FileReceiverState {
  initId: string | null;
  transferConnection: TransferConnection;
  fileMetadata: FileMetadata | null;
  errorMessage: string | null;
  fileTransferInfo: FileTransferInfo;
  transferStatus: TransferStatus;
  transferProgress: TransferProgress;
  receivedChunkData: ArrayBuffer[];
  fileUrl: string | null;
  // Used for conditional rendering (e.g., hide WebSocketStatusIndicator on MissingSenderId page).
  isReceiverFlowActive: boolean;
  // Not used yet, only set during finalize transfer
  lastValidSenderId: string | null;
  actions: FileReceiverActions;
}

// Zustand Store for File Receiver
export const useFileReceiverStore = create<FileReceiverState>()((set, get) => ({
  initId: null,
  transferConnection: {
    senderId: null,
    recipientId: null,
    isConnected: false,
  },
  fileMetadata: null,
  errorMessage: null,
  isSenderTransferring: false,
  fileTransferInfo: {
    totalSize: 0,
    totalChunks: 0,
  },
  transferStatus: {
    uploadedSize: 0,
    receivedBytes: 0,
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
  receivedChunkData: [],
  fileUrl: null,
  isReceiverFlowActive: false,
  lastValidSenderId: null,
  actions: {
    setInitId: (id) => set({ initId: id }),
    setTransferConnection: (transferConnection) =>
      set({
        transferConnection: {
          ...get().transferConnection,
          ...transferConnection,
        },
      }),
    setFileMetadata: (fileMetadata) => set({ fileMetadata }),
    setErrorMessage: (errorMessage) => set({ errorMessage }),
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
    setReceivedChunkData: (receivedChunkData: ArrayBuffer) => {
      if (get().transferStatus.isTransferCanceled) return; // Don't store data if transfer is canceled

      set({
        receivedChunkData: [...get().receivedChunkData, receivedChunkData],
      });
    },
    clearTransferState: () =>
      set({
        fileTransferInfo: {
          totalChunks: 0,
          totalSize: 0,
        },
        transferStatus: {
          ...get().transferStatus,
          uploadedSize: 0,
          receivedBytes: 0,
          chunkIndex: 0,
          chunkDataSize: 0,
          isTransferring: false,
          isTransferCompleted: false,
        },
        transferProgress: {
          sender: 0,
          receiver: 0,
        },
        receivedChunkData: [],
      }),
    finalizeTransfer: () => {
      const { fileMetadata, transferConnection, receivedChunkData, fileUrl } =
        get();
      const blobData = new Blob(receivedChunkData, {
        type: fileMetadata?.type || "application/octet-stream",
      });

      // File size mismatch validation
      if (blobData.size === 0 || blobData.size !== fileMetadata?.size) {
        set({
          errorMessage: "File reconstruction failed. Size mismatch.",
          transferStatus: {
            ...get().transferStatus,
            isTransferring: false,
            isTransferError: true,
            isTransferCanceled: false,
            isTransferCompleted: false,
          },
        });
        console.error(
          `File size mismatch. Blob size: ${blobData.size}. Expected: ${fileMetadata?.size}`,
        );
        return;
      }

      // Revoke existing file URL if any
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }

      // Create a new file URL for the reconstructed file
      const newFileUrl = URL.createObjectURL(blobData);

      set({
        fileUrl: newFileUrl,
        transferStatus: {
          ...get().transferStatus,
          isTransferring: false,
          isTransferError: false,
          isTransferCanceled: false,
          isTransferCompleted: true,
        },
        receivedChunkData: [],
        lastValidSenderId: transferConnection.senderId,
      });

      console.info("File successfully reconstructed. URL:", newFileUrl);
    },
    setIsReceiverFlowActive: (isReceiverFlowActive) =>
      set({ isReceiverFlowActive }),
    setLastValidSenderId: (lastValidSenderId) => set({ lastValidSenderId }),
  },
}));

// Custom Hooks for accessing store and actions
export const useFileReceiverActions = () =>
  useFileReceiverStore((state) => state.actions);
