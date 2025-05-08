import { create } from "zustand";
import { WebSocketLike } from "react-use-websocket/dist/lib/types";

import { CHUNK_SIZE } from "@/lib/constants";
import { readFileAsArrayBuffer } from "@/lib/utils";
import { FileMetadata } from "@/types/file";
import { FileChunkRequest, FileEndRequest } from "@/types/webSocketMessages";

interface FileTransferConnection {
  senderId: string | null;
  recipientId: string | null;
}

interface FileTransferStatus {
  totalChunks: number;
  chunkDataSize: number;
  offset: number;
  chunkIndex: number;
  progress: number;
  isTransferring: boolean;
  isSenderComplete: boolean;
  isRecipientComplete: boolean;
  isError: boolean;
}

interface WebSocketHandlers {
  sendJsonMessage: ((msg: unknown) => void) | undefined;
  sendMessage: ((msg: string | ArrayBuffer | Blob) => void) | undefined;
  getWebSocket: (() => WebSocketLike | null) | undefined;
}

interface FileSenderActions {
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

interface FileSenderState {
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
    progress: 0,
    isTransferring: false,
    isSenderComplete: false,
    isRecipientComplete: false,
    isError: false,
  },
  wsHandlers: {
    sendJsonMessage: undefined,
    sendMessage: undefined,
    getWebSocket: undefined,
  },
  hasReset: false,
  actions: {
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
    sendNextChunk: async () => {
      const { file, transferConnection, transferStatus, wsHandlers } = get();
      const { sendJsonMessage, sendMessage } = wsHandlers;

      const { chunkIndex, totalChunks, offset } = transferStatus;

      if (
        !file ||
        !transferConnection.recipientId ||
        !sendJsonMessage ||
        !sendMessage
      ) {
        set({ errorMessage: "No file or recipient found" });
        return;
      }

      if (chunkIndex >= totalChunks) {
        console.log("All data sent. Sending fileEnd signal.");
        set({
          transferStatus: {
            ...transferStatus,
            isSenderComplete: true,
            isTransferring: false,
          },
        });
        sendJsonMessage({
          type: "fileEnd",
          fileName: file.name,
          totalChunks: totalChunks,
          totalSize: file.size,
          lastChunkIndex: chunkIndex,
          uploadedSize: offset,
        } satisfies FileEndRequest);
        return;
      }

      try {
        const { chunkData, chunkDataSize } = await readFileAsArrayBuffer(
          file,
          transferStatus.offset,
          CHUNK_SIZE,
        );

        // Stop if no data was read (e.g. offset beyond file size)
        if (chunkDataSize === 0) {
          console.warn("No chunk data read. Skipping send.");
          set({
            transferStatus: {
              ...transferStatus,
              isSenderComplete: true,
              isTransferring: false,
            },
          });
          return;
        }

        const uploadedSize = transferStatus.offset + chunkDataSize;
        const transferProgress = Math.min(
          100,
          Math.floor((uploadedSize / file.size) * 100),
        );

        sendJsonMessage({
          type: "fileChunk",
          fileName: file.name,
          totalChunks: transferStatus.totalChunks,
          totalSize: file.size,
          chunkIndex: transferStatus.chunkIndex,
          chunkDataSize,
          uploadedSize,
          transferProgress,
        } satisfies FileChunkRequest);
        sendMessage(chunkData);

        set({
          transferStatus: {
            ...transferStatus,
            chunkDataSize,
            progress: transferProgress,
            isTransferring: true,
          },
        });

        console.log(
          `Chunk ${chunkIndex}/${totalChunks} sent. Progress: ${transferProgress}%`,
        );
      } catch (error: unknown) {
        const errorMsg = "Failed to send next chunk";
        set({ errorMessage: errorMsg });
        console.error(errorMsg + error);
      }
    },
    resetTransferStatus: () =>
      set({
        transferStatus: {
          totalChunks: 0,
          chunkDataSize: 0,
          offset: 0,
          chunkIndex: 0,
          progress: 0,
          isTransferring: false,
          isSenderComplete: false,
          isRecipientComplete: false,
          isError: false,
        },
      }),
    setHasReset: (value) => set({ hasReset: value }),
  },
}));

export const useFileSenderActions = () =>
  useFileSenderStore((state) => state.actions);

export const useWebSocketHandlers = () =>
  useFileSenderStore((state) => state.wsHandlers);
