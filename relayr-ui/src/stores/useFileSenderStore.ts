// External Libraries
import { WebSocketLike } from "react-use-websocket/dist/lib/types";
import { create } from "zustand";

// Types
import { FileMetadata } from "@/types/file";

// Helper Functions
import { sendNextChunk as sendNextChunkHelper } from "@/lib/sendNextChunk";
import { WebSocketSenderTextMessageResponse } from "@/types/webSocketMessages";

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
  connectWebSocket: (url: string) => void;
  disconnectWebSocket: () => void;
  processWebSocketTextMessage: (
    wsMsg: WebSocketSenderTextMessageResponse,
  ) => void;
  processWebSocketOnClose: (close: CloseEvent) => void;
}

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

// Singleton WebSocket instance (global for SPA)
let ws: WebSocket | null = null;

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
      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          get().actions.processWebSocketTextMessage(parsed);
        } catch (e) {
          console.error("❌ Error parsing websocket message:", e);
        }
      };
      set({
        webSocketHandlers: {
          sendJsonMessage: (msg: unknown) => {
            if (ws && ws.readyState === WebSocket.OPEN)
              ws.send(JSON.stringify(msg));
          },
          sendMessage: (msg: string | ArrayBuffer | Blob) => {
            if (ws && ws.readyState === WebSocket.OPEN) ws.send(msg);
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
      wsMsg: WebSocketSenderTextMessageResponse,
    ) => {
      const actions = get().actions;
      const file = get().file;
      const fileMetadata = get().fileMetadata;
      const { senderId } = get().transferConnection;
      const { offset, chunkIndex, chunkDataSize } = get().transferStatus;
      const { sender: senderProgress } = get().transferProgress;

      if (!wsMsg.success) {
        if (wsMsg.message?.includes("is no longer connected")) {
          actions.setErrorMessage(
            "Recipient is no longer connection. Please try again.",
          );
          actions.setTransferConnection({ recipientId: null });
          actions.clearTransferState();
        } else {
          actions.setErrorMessage(wsMsg.message ?? "Unknown error occurred");
        }
        return;
      }

      switch (wsMsg.type) {
        case "register":
          actions.setErrorMessage(null);
          actions.setTransferConnection({ senderId: wsMsg.connId });
          if (!fileMetadata) {
            const errorMsg = "File metadata not available";
            actions.setErrorMessage(errorMsg);
            console.error(errorMsg);
            return;
          }
          get().webSocketHandlers.sendJsonMessage?.({
            type: "fileMeta",
            name: fileMetadata.name,
            size: fileMetadata.size,
            mimeType: fileMetadata.type,
          });
          actions.setTransferShareLink(
            `${window.location.origin}/transfer/receive?id=${wsMsg.connId}`,
          );
          actions.setIsLoading(false);
          break;
        case "recipientReady":
          actions.setErrorMessage(null);
          actions.setTransferConnection({ recipientId: wsMsg.recipientId });
          get().webSocketHandlers.sendJsonMessage?.({
            type: "senderAck",
            requestType: "recipientReady",
            recipientId: wsMsg.recipientId,
            status: "success",
          });
          actions.setTransferStatus({
            isTransferring: false,
            isTransferError: false,
            isTransferCanceled: false,
            isTransferCompleted: false,
          });
          actions.clearTransferState();
          break;
        case "cancelRecipientReady":
          actions.setTransferConnection({ recipientId: null });
          actions.setErrorMessage(
            `Recipient \`${wsMsg.recipientId}\` canceled the connection`,
          );
          break;
        case "fileTransferAck":
          if (!file) {
            const errorMsg = "No file found. Cannot process acknoledgment";
            actions.setErrorMessage(errorMsg);
            console.error(errorMsg);
            return;
          }
          const { isTransferCanceled } = get().transferStatus;
          if (isTransferCanceled) return;
          if (wsMsg.status === "acknowledged") {
            if (
              chunkIndex !== wsMsg.chunkIndex &&
              senderProgress !== wsMsg.recipientTransferProgress
            ) {
              actions.setErrorMessage(
                "Upload out of sync. Please try again or check your connection",
              );
              actions.setTransferStatus({
                isTransferring: false,
                isTransferError: true,
                isTransferCanceled: false,
                isTransferCompleted: false,
              });
              return;
            }
            actions.setTransferStatus({
              offset: offset + chunkDataSize,
              chunkIndex: chunkIndex + 1,
            });
            actions.setTransferProgress({
              receiver: wsMsg.recipientTransferProgress,
            });
            if (!isTransferCanceled) actions.sendNextChunk();
          } else if (wsMsg.status === "completed") {
            actions.setTransferStatus({
              isTransferring: false,
              isTransferError: false,
              isTransferCanceled: false,
              isTransferCompleted: true,
            });
            const wsInstance = get().webSocketHandlers.getWebSocket?.();
            if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
              wsInstance.close(
                1000,
                `Sender [${senderId}]: Transfer completed, closing WebSocket connection.`,
              );
            }
          } else if (wsMsg.status === "error") {
            actions.setTransferStatus({
              isTransferring: false,
              isTransferError: true,
              isTransferCanceled: false,
              isTransferCompleted: false,
            });
            actions.setErrorMessage(
              "Transfer failed: receiver reported an error.",
            );
            console.error("[Sender] Receiver reported file transfer error", {
              chunkIndex: wsMsg.chunkIndex,
              receiverProgress: wsMsg.recipientTransferProgress,
              uploadedSize: wsMsg.uploadedSize,
            });
          } else {
            const errorMsg = `Unknown acknowledgment status: ${wsMsg.status}`;
            actions.setErrorMessage(errorMsg);
            console.error(errorMsg);
          }
          break;
        case "cancelRecipientTransfer":
          actions.setTransferStatus({ isTransferCanceled: true });
          actions.setErrorMessage(
            `Recipient \`${wsMsg.recipientId}\` canceled the transfer`,
          );
          break;
        default:
          console.error("[WebSocket] Unknown message type received:", wsMsg);
          break;
      }
    },
    processWebSocketOnClose: (close: CloseEvent) => {
      const actions = get().actions;
      console.info("❌ Disconnected", close.code);
      actions.setWebSocketUrl(null);
      actions.setTransferShareLink(null);
      actions.setTransferConnection({ senderId: null, recipientId: null });
      if (close.code === 1000) return;
      else if (close.code === 1006) {
        actions.setErrorMessage("Lost connection to the server");
      } else {
        actions.setErrorMessage(`Disconnected: Code ${close.code}`);
      }
    },
  },
}));

export const useFileSenderActions = () =>
  useFileSenderStore((state) => state.actions);

export const useSenderWebSocketHandlers = () =>
  useFileSenderStore((state) => state.webSocketHandlers);
