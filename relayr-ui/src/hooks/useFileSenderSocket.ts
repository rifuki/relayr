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
  WebSocketSenderTextMessageResponse,
  SenderAckRequest,
} from "@/types/webSocketMessages";

export function useFileSenderSocket() {
  const file = useFileSenderStore((state) => state.file);
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const { recipientId } = useFileSenderStore(
    (state) => state.transferConnection,
  );
  const webSocketUrl = useFileSenderStore((state) => state.webSocketUrl);
  const {
    offset,
    chunkIndex,
    chunkDataSize,
    isTransferring,
    isTransferCanceled,
  } = useFileSenderStore((state) => state.transferStatus);
  const { sender: senderProgress } = useFileSenderStore(
    (state) => state.transferProgress,
  );
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
      onClose: (close: CloseEvent) => processWebSocketOnClose(close),
      onError: (error: Event) => {
        console.error("🔥 Error", error);
        actions.setErrorMessage("WebSocket error occurred");
      },
    });

  const processWebSocketTextMessage = (
    wsMsg: WebSocketSenderTextMessageResponse,
  ) => {
    if (!wsMsg.success) {
      if (wsMsg.message.includes("is no longer connected")) {
        actions.setErrorMessage(
          "Recipient is no longer connection. Please try again.",
        );
        actions.setTransferConnection({ recipientId: null });
        actions.clearTransferState();
        return;
      }

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
    sendJsonMessage({
      type: "senderAck",
      requestType: "recipientReady",
      recipientId: msg.recipientId,
      status: "success",
    } satisfies SenderAckRequest);
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

    if (isTransferCanceled) {
      actions.setErrorMessage("You canceled the file transfer");
      console.warn("Transfer has been canceled. No more chunks will be sent.");
      actions.clearTransferState();
      return;
    }

    if (ack.status === "acknowledged") {
      if (
        chunkIndex !== ack.chunkIndex &&
        senderProgress !== ack.recipientTransferProgress
      ) {
        actions.setErrorMessage(
          " Upload out of sync. Please try again or check your connection ",
        );
        actions.setTransferStatus({
          isTransferError: true,
          isTransferring: false,
        });
        return;
      }
      actions.setTransferStatus({
        offset: offset + chunkDataSize,
        chunkIndex: chunkIndex + 1,
      });
      actions.setTransferProgress({ receiver: ack.recipientTransferProgress });
      actions.sendNextChunk();
    } else if (ack.status === "completed") {
      actions.setTransferStatus({
        isTransferring: false,
        isTransferCompleted: true,
      });
    } else if (ack.status === "error") {
      actions.setTransferStatus({
        isTransferring: false,
        isTransferError: true,
      });
      actions.setErrorMessage("Transfer failed: receiver reported an error.");
      console.error("[Sender] Receiver reported file transfer error", {
        chunkIndex: ack.chunkIndex,
        receiverProgress: ack.recipientTransferProgress,
        uploadedSize: ack.uploadedSize,
      });
    } else {
      const errorMsg = `Unknown acknowledgment status: ${ack.status}`;
      actions.setErrorMessage(errorMsg);
      console.error(errorMsg);
    }
  };

  const processWebSocketOnClose = (close: CloseEvent) => {
    console.info("❌ Disconnected", close.code);

    actions.setWebSocketUrl(null);

    actions.setTransferShareLink(null);
    actions.setTransferConnection({ senderId: null, recipientId: null });
    actions.setIsLoading(false);
    actions.setErrorMessage(null);

    if (close.code === 1000) return;
    else if (close.code === 1006) {
      actions.setErrorMessage("Lost connection to the server");
    } else {
      actions.setErrorMessage(`Disconnected: Code ${close.code}`);
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
      if (isTransferring) {
        e.preventDefault();
      } else if (readyState === WebSocket.OPEN && recipientId) {
        sendJsonMessage({
          type: "cancelSenderReady",
        } satisfies CancelSenderReadyRequest);
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isTransferring, readyState, sendJsonMessage, recipientId]);

  return { readyState };
}
