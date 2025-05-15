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

interface FileSenderState {
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

      if (transferStatus.isCanceled) {
        set({ errorMessage: "You canceled the transfer" });
        console.warn(
          "Transfer has been canceled. No more chunks will be sent.",
        );
        return;
      }

      if (chunkIndex >= totalChunks) {
        //console.log("All data sent. Sending fileEnd signal.");
        sendJsonMessage({
          type: "fileEnd",
          fileName: file.name,
          totalSize: file.size,
          totalChunks,
          lastChunkIndex: chunkIndex,
          uploadedSize: offset,
        } satisfies FileEndRequest);

        set({
          transferStatus: {
            ...transferStatus,
            isSenderComplete: true,
            isTransferring: false,
          },
        });

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
        const senderTransferProgress = Math.min(
          100,
          Math.floor((uploadedSize / file.size) * 100),
        );

        sendJsonMessage({
          type: "fileChunk",
          fileName: file.name,
          totalSize: file.size,
          totalChunks: transferStatus.totalChunks,
          chunkIndex: transferStatus.chunkIndex,
          chunkDataSize,
          uploadedSize,
          senderTransferProgress,
        } satisfies FileChunkRequest);
        sendMessage(chunkData);

        set({
          transferStatus: {
            ...transferStatus,
            chunkDataSize,
            uploadedSize,
            totalSize: file.size,
            senderProgress: senderTransferProgress,
            isTransferring: true,
          },
        });

        //console.log(
        //  `Chunk ${chunkIndex}/${totalChunks} sent. Progress: ${transferProgress}%`,
        //);
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
