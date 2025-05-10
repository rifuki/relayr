import { useEffect } from "react";
import useWebSocket from "react-use-websocket";
import {
  useFileSenderStore,
  useFileSenderActions,
} from "@/stores/useFileSenderStore";
import {
  FileTransferAckResponse,
  CancelRecipientReadyResponse,
  CancelSenderReadyRequest,
  FileMetaRequest,
  RecipientReadyResponse,
  RegisterResponse,
  WebSocketMessageResponse,
} from "@/types/webSocketMessages";

export function useFileSenderSocket() {
  const file = useFileSenderStore((state) => state.file);
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const transferConnection = useFileSenderStore(
    (state) => state.transferConnection,
  );
  const webSocketUrl = useFileSenderStore((state) => state.webSocketUrl);
  const transferStatus = useFileSenderStore((state) => state.transferStatus);
  const actions = useFileSenderActions();

  const { sendJsonMessage, readyState, sendMessage, getWebSocket } =
    useWebSocket(webSocketUrl, {
      onMessage: (wsMsg: MessageEvent<string>) => {
        actions.setErrorMessage(null);

        try {
          const parsedMessage = JSON.parse(wsMsg.data);
          processWebSocketTextMessage(parsedMessage);
        } catch (error: unknown) {
          console.error("❌ Error parsing websocket message:", error);
        }
      },
      onClose: (error: CloseEvent) => processWebSocketOnClose(error),
      onError: (error: Event) => {
        console.error("🔥 Error", error);
        actions.setErrorMessage("WebSocket error occurred");
      },
    });

  const processWebSocketTextMessage = (wsMsg: WebSocketMessageResponse) => {
    if (!wsMsg.success) {
      actions.setErrorMessage(wsMsg.message ?? "Unknown error occurred");
      return;
    }

    switch (wsMsg.type) {
      case "register":
        processRegisterMessage(wsMsg);
        break;
      case "recipientReady":
        processRecipientReadyMessage(wsMsg);
        break;
      case "cancelRecipientReady":
        processCancelRecipientReadyMessage(wsMsg);
        break;
      case "fileTransferAck":
        processFileTransferAcknowledgmentMessage(wsMsg);
        break;
      default:
        console.error("[WebSocket] Unknown message type received:", wsMsg);
        break;
    }
  };

  const processRegisterMessage = (msg: RegisterResponse) => {
    if (!fileMetadata) {
      const errorMsg = "File metadata not available";
      actions.setErrorMessage(errorMsg);
      console.error(errorMsg);
      return;
    }

    sendJsonMessage({
      type: "fileMeta",
      name: fileMetadata.name,
      size: fileMetadata.size,
      mimeType: fileMetadata.type,
    } satisfies FileMetaRequest);

    const transferShareLink = `${window.location.origin}/receive?id=${msg.connId}`;
    actions.setTransferShareLink(transferShareLink);
    actions.setTransferConnection({ senderId: msg.connId });
    actions.setIsLoading(false);
  };

  const processRecipientReadyMessage = (msg: RecipientReadyResponse) => {
    actions.setTransferConnection({ recipientId: msg.recipientId });
  };

  const processCancelRecipientReadyMessage = (
    msg: CancelRecipientReadyResponse,
  ) => {
    actions.setTransferConnection({ recipientId: null });

    const recipientId = msg.recipientId;
    const errorMsg = `Recipient \`${recipientId}\` canceled the connection`;
    actions.setErrorMessage(errorMsg);
  };

  const processFileTransferAcknowledgmentMessage = (
    ack: FileTransferAckResponse,
  ) => {
    if (!file) {
      const errorMsg = "No file found. Cannot process acknoledgment";
      actions.setErrorMessage(errorMsg);
      console.error(errorMsg);
      return;
    }

    if (transferStatus.isCanceled) {
      actions.setErrorMessage("You canceled the file transfer");
      console.warn("Transfer has been canceled. No more chunks will be sent.");
      return;
    }

    if (ack.status === "acknowledged") {
      if (transferStatus.chunkIndex != ack.chunkIndex) {
        actions.setErrorMessage(
          " Upload out of sync. Please try again or check your connection ",
        );
        actions.setTransferStatus({ isError: true });
        return;
      }
      actions.setTransferStatus({
        offset: transferStatus.offset + transferStatus.chunkDataSize,
        chunkIndex: transferStatus.chunkIndex + 1,
      });
      actions.sendNextChunk();
    } else if (ack.status === "completed") {
      transferStatus.isRecipientComplete = true;
      transferStatus.isTransferring = false;
    } else {
      const errorMsg = `Unknown acknowledgment status: ${ack.status}`;
      actions.setErrorMessage(errorMsg);
      console.error(errorMsg);
    }
  };

  const processWebSocketOnClose = (error: CloseEvent) => {
    console.info("❌ Disconnected", error.code);

    actions.setWebSocketUrl(null);

    actions.setTransferShareLink(null);
    actions.setTransferConnection({ senderId: null, recipientId: null });
    actions.setIsLoading(false);
    actions.setErrorMessage(null);

    if (error.code === 1000) return;
    else if (error.code === 1006) {
      actions.setErrorMessage("Lost connection to the server");
    } else {
      actions.setErrorMessage(`Disconnected: Code ${error.code}`);
    }
  };

  useEffect(() => {
    if (sendJsonMessage && sendMessage) {
      actions.setWebSocketHandlers({
        sendJsonMessage: sendJsonMessage,
        sendMessage: sendMessage,
        getWebSocket: getWebSocket,
      });
    }
  }, [sendJsonMessage, sendMessage, getWebSocket, actions]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (transferStatus.isTransferring) {
        e.preventDefault();
      } else if (
        readyState === WebSocket.OPEN &&
        transferConnection.recipientId
      ) {
        sendJsonMessage({
          type: "cancelSenderReady",
        } satisfies CancelSenderReadyRequest);
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    transferStatus.isTransferring,
    readyState,
    sendJsonMessage,
    transferConnection.recipientId,
  ]);

  return { readyState };
}
