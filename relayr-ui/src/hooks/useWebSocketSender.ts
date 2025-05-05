import { useEffect, useMemo, useRef, useState } from "react";

import useWebSocket from "react-use-websocket";

import { toast } from "sonner";
import { FileMetadata } from "@/types/file";
import {
  AckResponse,
  CancelRecipientReadyResponse,
  CancelSenderReadyRequest,
  FileChunkRequest,
  FileEndRequest,
  FileMetaRequest,
  RecipientReadyResponse,
  RegisterResponse,
  WebSocketMessageResponse,
} from "@/types/webSocketMessages";
import { CHUNK_SIZE } from "@/lib/constants";
import { readFileAsArrayBuffer } from "@/lib/utils";
import { WS_RELAY_API_URL } from "@/lib/api";

export function useWebsocketSender() {
  const [webSocketUrl, setWebSocketUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [connectionInfo, setConnectionInfo] = useState<{
    senderId: string | null;
    recipientId: string | null;
  }>({
    senderId: null,
    recipientId: null,
  });
  const transferFileShareLink = useMemo(() => {
    if (!connectionInfo.senderId) return null;

    return `${window.location.origin}/receive?id=${connectionInfo.senderId}`;
  }, [connectionInfo.senderId]);

  const [transferFileProgress, setTransferFileProgress] = useState<number>(0);
  const [isTransferringFile, setIsTransferringFile] = useState<boolean>(false);
  const [isTransferFileComplete, setIsTransferFileComplete] =
    useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [completedTransferFileLink, setCompletedTransferFileLink] = useState<
    string | null
  >(null);
  const [completedRecipientId, setCompletedRecipientId] = useState<
    string | null
  >(null);

  // Refs for file chunking
  const fileTotalChunksRef = useRef(0);
  const fileChunkDataSizeRef = useRef(0);
  const fileOffsetRef = useRef(0);
  const fileChunkIndexRef = useRef(0);

  const fileRef = useRef<File | null>(null);
  const fileMetadataRef = useRef<FileMetadata | null>(null);

  const { getWebSocket, sendJsonMessage, sendMessage, readyState } =
    useWebSocket(webSocketUrl, {
      shouldReconnect: () => false,
      onClose: (error: CloseEvent) => processWebSocketOnClose(error),
      onError: (error: Event) => {
        console.error("🔥 Error", error);
        setErrorMessage("WebSocket error occurred");
      },
      onMessage: (wsMessage: MessageEvent<string>) => {
        setErrorMessage(null);

        try {
          const parsedMessage: WebSocketMessageResponse = JSON.parse(
            wsMessage.data,
          );
          processWebSocketTextMessage(parsedMessage);
        } catch (error: unknown) {
          console.error("❌ Error parsing message:", error);
          setErrorMessage("Invalid websocket response message format!");
        }
      },
    });

  const processWebSocketTextMessage = (msg: WebSocketMessageResponse) => {
    if (!msg.success) {
      setErrorMessage(msg.message ?? "Unknown error occurred");
      setIsPageLoading(false);
      return;
    }

    switch (msg.type) {
      case "register":
        processRegisterMessage(msg);
        break;
      case "recipientReady":
        processRecipientReadyMessage(msg);
        break;
      case "cancelRecipientReady":
        processCancelRecipientReadyMessage(msg);
        break;
      case "ack":
        processAcknowledgmentMessage(msg);
        break;
      default:
        console.warn("Unknown text message type received:", msg);
        break;
    }
  };

  const processRegisterMessage = (msg: RegisterResponse) => {
    const metadata = fileMetadataRef.current;
    if (!metadata) {
      const errorMessage = "File metadata not available";
      setErrorMessage(errorMessage);
      console.error(errorMessage);
      return;
    }

    sendJsonMessage({
      type: "fileMeta",
      fileName: metadata.name,
      fileSize: metadata.size,
      mimeType: metadata.type,
    } satisfies FileMetaRequest);

    setConnectionInfo((prev) => ({ ...prev, senderId: msg.connId }));
    setIsPageLoading(false);
  };

  const processRecipientReadyMessage = (msg: RecipientReadyResponse) => {
    setConnectionInfo((prev) => ({ ...prev, recipientId: msg.recipientId }));
  };

  const processCancelRecipientReadyMessage = (
    msg: CancelRecipientReadyResponse,
  ) => {
    const recipientId = msg.recipientId;
    const errorMessage = `Recipient \`${recipientId}\` canceled the connection`;
    setErrorMessage(errorMessage);

    setConnectionInfo((prev) => ({ ...prev, recipientId: null }));
  };

  const processAcknowledgmentMessage = (ack: AckResponse) => {
    const file = fileRef.current;
    if (!file) {
      const errorMessage = "No file found. Cannot process acknowledgment.";
      setErrorMessage(errorMessage);
      console.error(errorMessage);
      return;
    }

    if (ack.status === "acknowledged") {
      if (
        ack.chunkIndex !== fileChunkIndexRef.current &&
        ack.uploadedSize !==
          fileOffsetRef.current + fileChunkDataSizeRef.current
      ) {
        const errorMessage =
          "Upload out of sync. Please try again or check your connection";
        setErrorMessage(errorMessage);
        return;
      }

      if (getWebSocket()?.readyState === WebSocket.OPEN) {
        if (fileOffsetRef.current < file.size) {
          fileOffsetRef.current += fileChunkDataSizeRef.current;
          fileChunkIndexRef.current += 1;
          sendNextChunk();
        } else {
          sendJsonMessage({
            type: "fileEnd",
            fileName: file.name,
            totalChunks: fileTotalChunksRef.current,
            totalSize: file.size,
            chunkIndex: fileChunkIndexRef.current,
            uploadedSize: fileOffsetRef.current,
          } satisfies FileEndRequest);
        }
      } else {
        setErrorMessage("WebSocket is not open");
      }
    } else if (ack.status === "completed") {
      setCompletedTransferFileLink(transferFileShareLink);
      setCompletedRecipientId(connectionInfo.recipientId);
      setIsTransferFileComplete(true);

      toast.success("File transfer complete");

      setConnectionInfo((prev) => ({ ...prev, setRecipientId: null }));
      const closeReason = "Transfer complete";
      getWebSocket()?.close(1000, closeReason);
      console.info("✅ WebSocket closed:", closeReason);
    }
  };

  const processWebSocketOnClose = (error: CloseEvent) => {
    console.info("❌ Disconnected", error.code);

    setWebSocketUrl(null);
    setConnectionInfo({ senderId: null, recipientId: null });
    setIsPageLoading(false);

    if (error.code === 1000) return;
    else if (error.code === 1006) {
      setErrorMessage("Lost connection to the server");
    } else {
      setErrorMessage(`Disconnected: Code ${error.code}`);
    }
  };

  const sendNextChunk = async () => {
    const file = fileRef.current;
    if (!file || !connectionInfo.recipientId) {
      const errorMessage = "No file or recipient found.";
      setErrorMessage(errorMessage);
      console.error(errorMessage);
      return;
    }

    try {
      const { chunkData, chunkDataSize } = await readFileAsArrayBuffer(
        file,
        fileOffsetRef.current,
        CHUNK_SIZE,
      );

      fileChunkDataSizeRef.current = chunkDataSize;
      const uploadedSize = fileOffsetRef.current + fileChunkDataSizeRef.current;
      const progress = Math.min(
        100,
        Math.floor((uploadedSize / file.size) * 100),
      );

      if (getWebSocket()?.readyState === WebSocket.OPEN) {
        sendJsonMessage({
          type: "fileChunk",
          fileName: file.name,
          totalChunks: fileTotalChunksRef.current,
          totalSize: file.size,
          chunkIndex: fileChunkIndexRef.current,
          chunkDataSize,
          uploadedSize,
          transferProgress: progress,
        } satisfies FileChunkRequest);
        sendMessage(chunkData);

        if (progress !== transferFileProgress) {
          setTransferFileProgress(progress);
        }
      } else {
        setErrorMessage("WebSocket is not open");
      }
    } catch (error: unknown) {
      const errorMessage = "Failed to send next chunk";
      setErrorMessage(errorMessage);
      console.error(errorMessage + error);
    }
  };

  const handleGenerateTransferFileLink = (
    file: File,
    metadata: FileMetadata,
  ) => {
    setIsPageLoading(true);
    resetAllStates();

    fileRef.current = file;
    fileMetadataRef.current = metadata;

    setWebSocketUrl(WS_RELAY_API_URL);
  };

  const handleCloseWebSocketConnection = () => {
    getWebSocket()?.close(1000, "Sender closed the connection");
    const interval = setInterval(() => {
      if (getWebSocket()?.readyState === WebSocket.CLOSED) {
        clearInterval(interval);

        setWebSocketUrl(null);
        setErrorMessage(null);
        setConnectionInfo({ senderId: null, recipientId: null });
        setIsPageLoading(false);
      }
    }, 200);
  };

  const handleCancelSenderReady = () => {
    resetChunkTransferFile();

    sendJsonMessage({
      type: "cancelSenderReady",
    } satisfies CancelSenderReadyRequest);

    setConnectionInfo((prev) => ({ ...prev, setRecipientId: null }));
  };

  //const handleSendFile = (file: File) => {
  const handleSendFile = () => {
    const file = fileRef.current;
    if (!file || !connectionInfo.recipientId) {
      const errorMessage = "Missing file or recipient";
      setErrorMessage(errorMessage);
      console.error(errorMessage);
      return;
    }

    fileRef.current = file;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    resetChunkTransferFile(true, totalChunks);

    sendNextChunk();
  };

  useEffect(() => {
    function handleBeforeUnload() {
      if (readyState === WebSocket.OPEN && connectionInfo.recipientId) {
        sendJsonMessage({
          type: "cancelSenderReady",
        } satisfies CancelSenderReadyRequest);
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [readyState, connectionInfo.recipientId, sendJsonMessage]);

  const resetChunkTransferFile = (
    isTransferringFile: boolean = false,
    totalChunks: number = 0,
  ) => {
    setIsTransferringFile(isTransferringFile);
    setTransferFileProgress(0);
    fileTotalChunksRef.current = totalChunks;
    fileChunkDataSizeRef.current = 0;
    fileOffsetRef.current = 0;
    fileChunkIndexRef.current = 0;
  };

  const resetAllStates = () => {
    setWebSocketUrl(null);
    setErrorMessage(null);
    setConnectionInfo({ senderId: null, recipientId: null });
    setIsPageLoading(false);
    setTransferFileProgress(0);
    setIsTransferringFile(false);
    setIsTransferFileComplete(false);
    setCompletedTransferFileLink(null);
    setCompletedRecipientId(null);

    // Reset Refs
    fileTotalChunksRef.current = 0;
    fileChunkDataSizeRef.current = 0;
    fileOffsetRef.current = 0;
    fileChunkIndexRef.current = 0;

    // Reset file references
    fileRef.current = null;
    fileMetadataRef.current = null;
  };

  return {
    readyState,
    fileRef,
    fileMetadataRef,
    errorMessage,
    setErrorMessage,
    connectionInfo,
    isPageLoading,
    transferFileShareLink,
    isTransferringFile,
    transferFileProgress,
    isTransferFileComplete,
    resetChunkTransferFile,
    handleGenerateTransferFileLink,
    handleCloseWebSocketConnection,
    handleCancelSenderReady,
    handleSendFile,
    completedRecipientId,
    completedTransferFileLink,
    resetAllStates,
  };
}
