// External Libraries
import { WebSocketLike } from "react-use-websocket/dist/lib/types";
import { create } from "zustand";

// Types
import { FileMetadata } from "@/types/file";
import { WebSocketReceiverTextMessageResponse } from "@/types/webSocketMessages";

// Interfaces for Transfer Connection, File Transfer Info, Transfer Status, and Progress
interface TransferConnection {
  senderId: string | null;
  recipientId: string | null;
  isConnected: boolean;
}

interface FileTransferInfo {
  totalSize: number;
  totalChunks: number;
}

interface TransferStatus {
  uploadedSize: number;
  receivedBytes: number;
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

interface WebSocketHandlers {
  sendJsonMessage: ((msg: unknown) => void) | undefined;
  getWebSocket: (() => WebSocketLike | null) | undefined;
}

interface FileReceiverActions {
  setInitId: (id: string) => void;
  setTransferConnection: (
    transferConnection: Partial<TransferConnection>,
  ) => void;
  setFileMetadata: (fileMetadata: FileMetadata) => void;
  setErrorMessage: (errorMessage: string | null) => void;
  setWebSocketUrl: (webSocketUrl: string | null) => void;
  setWebSocketReadyState: (readyState: number) => void;
  setWebSocketHandlers: (webSocketHandlers: Partial<WebSocketHandlers>) => void;
  setFileTransferInfo: (fileTransferInfo: Partial<FileTransferInfo>) => void;
  setTransferStatus: (transferStatus: Partial<TransferStatus>) => void;
  setTransferProgress: (transferProgress: Partial<TransferProgress>) => void;
  setReceivedChunkData: (receivedChunkData: ArrayBuffer) => void;
  clearTransferState: () => void;
  finalizeTransfer: () => void;
  connectWebSocket: (url: string) => void;
  disconnectWebSocket: () => void;
  processWebSocketTextMessage: (
    wsMsg: WebSocketReceiverTextMessageResponse,
  ) => void;
  processWebSocketOnClose: (close: CloseEvent) => void;
  processWebSocketBlobMessage: (blobData: Blob) => Promise<void>;
}

interface FileReceiverState {
  initId: string | null;
  transferConnection: TransferConnection;
  fileMetadata: FileMetadata | null;
  errorMessage: string | null;
  webSocketUrl: string | null;
  webSocketReadyState: number;
  webSocketHandlers: WebSocketHandlers;
  fileTransferInfo: FileTransferInfo;
  transferStatus: TransferStatus;
  transferProgress: TransferProgress;
  receivedChunkData: ArrayBuffer[];
  fileUrl: string | null;
  actions: FileReceiverActions;
}

// Singleton WebSocket instance (global for SPA)
let ws: WebSocket | null = null;

export const useFileReceiverStore = create<FileReceiverState>()((set, get) => ({
  initId: null,
  transferConnection: {
    senderId: null,
    recipientId: null,
    isConnected: false,
  },
  fileMetadata: null,
  errorMessage: null,
  webSocketUrl: null,
  webSocketReadyState: -1,
  webSocketHandlers: {
    sendJsonMessage: undefined,
    getWebSocket: undefined,
  },
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
    setWebSocketUrl: (webSocketUrl) => set({ webSocketUrl }),
    setWebSocketReadyState: (readyState) =>
      set({ webSocketReadyState: readyState }),
    setWebSocketHandlers: (webSocketHandlers) =>
      set({
        webSocketHandlers: { ...get().webSocketHandlers, ...webSocketHandlers },
      }),
    setFileTransferInfo: (fileTransferInfo) => {
      if (get().transferStatus.isTransferCanceled) return;
      set({
        fileTransferInfo: {
          ...get().fileTransferInfo,
          ...fileTransferInfo,
        },
      });
    },
    setTransferStatus: (transferStatus) => {
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
        get().actions.clearTransferState();
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
      if (get().transferStatus.isTransferCanceled) return;
      set({
        transferProgress: {
          ...get().transferProgress,
          ...transferProgress,
        },
      });
    },
    setReceivedChunkData: (receivedChunkData: ArrayBuffer) => {
      if (get().transferStatus.isTransferCanceled) return;
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
      const { receivedChunkData, fileMetadata, fileUrl } = get();
      const blobData = new Blob(receivedChunkData, {
        type: fileMetadata?.type || "application/octet-stream",
      });

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

      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }

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
      });

      console.info("File successfully reconstructed. URL:", newFileUrl);
    },
    connectWebSocket: (url: string) => {
      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      )
        return;
      ws = new WebSocket(url);
      set({ webSocketReadyState: ws.readyState });
      ws.onopen = () => set({ webSocketReadyState: ws!.readyState });
      ws.onclose = (close) => {
        set({ webSocketReadyState: ws!.readyState });
        get().actions.processWebSocketOnClose(close);
      };
      ws.onerror = (error) => {
        set({ webSocketReadyState: ws!.readyState });
        console.error("🔥 Error", error);
        get().actions.setErrorMessage("WebSocket error occurred");
      };
      ws.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          await get().actions.processWebSocketBlobMessage(event.data);
        } else if (typeof event.data === "string") {
          try {
            const parsed = JSON.parse(event.data);
            get().actions.processWebSocketTextMessage(parsed);
          } catch (e) {
            console.error("❌ Error parsing websocket message:", e);
          }
        }
      };
      set({
        webSocketHandlers: {
          sendJsonMessage: (msg: unknown) => {
            if (ws && ws.readyState === WebSocket.OPEN)
              ws.send(JSON.stringify(msg));
          },
          getWebSocket: () => ws,
        },
      });
    },
    disconnectWebSocket: () => {
      if (ws) {
        ws.close();
        ws = null;
      }
      set({ webSocketReadyState: WebSocket.CLOSED });
    },
    processWebSocketTextMessage: (
      wsMsg: WebSocketReceiverTextMessageResponse,
    ) => {
      const actions = get().actions;
      const fileMetadata = get().fileMetadata;
      const { senderId, recipientId } = get().transferConnection;
      const { totalChunks } = get().fileTransferInfo;
      const { uploadedSize, receivedBytes, chunkIndex, chunkDataSize } =
        get().transferStatus;
      const { receiver: receiverTransferProgress } = get().transferProgress;

      if (!wsMsg.success) {
        if (
          wsMsg.message
            ?.toLowerCase()
            .includes("sender is already connected to recipient")
        ) {
          const wsInstance = get().webSocketHandlers.getWebSocket?.();
          if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
            const errorMsg = "Sender already connected to another recipent.";
            actions.setErrorMessage(errorMsg);
            wsInstance.close(1000, errorMsg);
            actions.setWebSocketUrl(null);
          }
        } else {
          actions.setErrorMessage(wsMsg.message ?? "unknown error occurred");
        }
        return;
      }

      switch (wsMsg.type) {
        case "register":
          actions.setErrorMessage(null);
          actions.setTransferConnection({ recipientId: wsMsg.connId });
          get().webSocketHandlers.sendJsonMessage?.({
            type: "recipientReady",
            senderId,
          });
          break;
        case "cancelSenderReady":
          const errMsg = "The sender has canceled the connection";
          get().webSocketHandlers.getWebSocket?.()?.close(1000, errMsg);
          actions.setErrorMessage(errMsg);
          actions.clearTransferState();
          actions.setTransferConnection({
            isConnected: false,
            recipientId: null,
          });
          break;
        case "senderAck":
          if (wsMsg.requestType === "recipientReady") {
            actions.setTransferConnection({ isConnected: true });
          } else {
            console.error(
              "[WebSocket] Unknown ack request type received:",
              wsMsg,
            );
          }
          break;
        case "fileChunk":
          const { isTransferCanceled } = get().transferStatus;
          if (isTransferCanceled && wsMsg.chunkIndex !== 0) return;
          if (wsMsg.chunkIndex === 0) {
            actions.setErrorMessage(null);
            actions.setTransferStatus({
              isTransferCanceled: false,
              isTransferError: false,
            });
            actions.clearTransferState();
          }
          actions.setFileTransferInfo({
            totalSize: wsMsg.totalSize,
            totalChunks: wsMsg.totalChunks,
          });
          actions.setTransferStatus({
            isTransferring: true,
            isTransferCanceled: false,
            uploadedSize: wsMsg.uploadedSize,
            chunkIndex: wsMsg.chunkIndex,
            chunkDataSize: wsMsg.chunkDataSize,
          });
          actions.setTransferProgress({ sender: wsMsg.senderTransferProgress });
          break;
        case "fileEnd":
          const isTransferCanceledEnd = get().transferStatus.isTransferCanceled;
          if (isTransferCanceledEnd || !fileMetadata) return;
          const isChunkIndexConsistent =
            wsMsg.lastChunkIndex === chunkIndex + 1;
          actions.setTransferStatus({ chunkIndex: wsMsg.lastChunkIndex });
          const isUploadedSizeConsistent = wsMsg.uploadedSize === receivedBytes;
          if (!isChunkIndexConsistent || !isUploadedSizeConsistent) {
            console.error("[FileEnd] Payload mismatch", {
              lastChunkIndexFromSender: wsMsg.lastChunkIndex,
              currentChunkIndex: chunkIndex + 1,
              uploadedSizeFromSender: wsMsg.uploadedSize,
              receivedBytesFromClient: receivedBytes,
            });
            actions.setErrorMessage(
              "Mismatch in file transfer data. Transfer may be corrupted.",
            );
            get().webSocketHandlers.sendJsonMessage?.({
              type: "fileTransferAck",
              senderId,
              status: "error",
              fileName: fileMetadata.name,
              totalChunks,
              uploadedSize,
              chunkIndex,
              chunkDataSize,
              recipientTransferProgress: receiverTransferProgress,
            });
            actions.setTransferStatus({
              isTransferError: true,
              isTransferring: false,
            });
            return;
          }
          get().webSocketHandlers.sendJsonMessage?.({
            type: "fileTransferAck",
            senderId,
            status: "completed",
            fileName: fileMetadata.name,
            totalChunks,
            uploadedSize,
            chunkIndex,
            chunkDataSize,
            recipientTransferProgress: receiverTransferProgress,
          });
          actions.finalizeTransfer();
          const wsInstanceEnd = get().webSocketHandlers.getWebSocket?.();
          if (wsInstanceEnd && wsInstanceEnd.readyState === WebSocket.OPEN) {
            wsInstanceEnd.close(
              1000,
              `Receiver [${recipientId}]: Transfer completed, closing WebSocket connection.`,
            );
          }
          break;
        case "restartTransfer":
          actions.setErrorMessage(null);
          actions.setTransferStatus({
            isTransferCanceled: false,
            isTransferError: false,
          });
          actions.clearTransferState();
          actions.setErrorMessage("Sender restarted the transfer.");
          break;
        case "cancelSenderTransfer":
          actions.setTransferStatus({ isTransferCanceled: true });
          actions.setErrorMessage(
            `Sender \`${wsMsg.senderId}\` canceled the transfer`,
          );
          break;
        default:
          console.error("[WebSocket] Unknown message type received:", wsMsg);
          break;
      }
    },
    processWebSocketBlobMessage: async (blobData: Blob) => {
      const { isTransferCanceled } = get().transferStatus;
      const fileMetadata = get().fileMetadata;
      const { receivedBytes } = get().transferStatus;
      const actions = get().actions;
      const { senderId } = get().transferConnection;
      const { totalChunks } = get().fileTransferInfo;
      const { uploadedSize, chunkIndex, chunkDataSize } = get().transferStatus;

      if (isTransferCanceled || !fileMetadata) return;

      try {
        const arrayBufferData = await blobData.arrayBuffer();
        actions.setReceivedChunkData(arrayBufferData);
        const newReceivedBytes = receivedBytes + arrayBufferData.byteLength;
        actions.setTransferStatus({ receivedBytes: newReceivedBytes });
        const receiverProgress = Math.min(
          100,
          Math.floor((newReceivedBytes / fileMetadata.size) * 100),
        );
        actions.setTransferProgress({ receiver: receiverProgress });
        get().webSocketHandlers.sendJsonMessage?.({
          type: "fileTransferAck",
          senderId,
          status: "acknowledged",
          fileName: fileMetadata.name,
          totalChunks,
          uploadedSize,
          chunkIndex,
          chunkDataSize,
          recipientTransferProgress: receiverProgress,
        });
      } catch (error) {
        console.error("Failed to read blob as ArrayBuffer:" + error);
      }
    },
    processWebSocketOnClose: (close: CloseEvent) => {
      const actions = get().actions;
      console.info("❌ Disconnected", close.code);
      actions.setWebSocketUrl(null);
      actions.setTransferConnection({ isConnected: false, recipientId: null });
      if (close.code === 1000) return;
      else if (close.code === 1006) {
        actions.setErrorMessage("Lost connection to the server");
      } else {
        actions.setErrorMessage(`Disconnected: Code ${close.code}`);
      }
    },
  },
}));

export const useFileReceiverActions = () =>
  useFileReceiverStore((state) => state.actions);

export const useReceiverWebSocketHandlers = () =>
  useFileReceiverStore((state) => state.webSocketHandlers);
