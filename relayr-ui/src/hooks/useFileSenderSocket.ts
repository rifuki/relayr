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
  CancelRecipientTransferResponse,
} from "@/types/webSocketMessages";
import { toast } from "sonner";

export function useFileSenderSocket() {
  const file = useFileSenderStore((state) => state.file);
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const { recipientId } = useFileSenderStore(
    (state) => state.transferConnection,
  );
  const webSocketUrl = useFileSenderStore((state) => state.webSocketUrl);
  const { offset, chunkIndex, chunkDataSize, isTransferring } =
    useFileSenderStore((state) => state.transferStatus);
  const { sender: senderProgress } = useFileSenderStore(
    (state) => state.transferProgress,
  );
  const actions = useFileSenderActions();

  const { sendJsonMessage, readyState, sendMessage, getWebSocket } =
    useWebSocket(webSocketUrl, {
      onMessage: (wsMsg: MessageEvent<string>) => {
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
      case "cancelRecipientTransfer":
        processCancelRecipientTransferMessage(wsMsg);
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
    actions.clearTransferState();
    actions.setTransferStatus({
      isTransferCanceled: false,
      isTransferError: false,
    });
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

    const { isTransferCanceled } = useFileSenderStore.getState().transferStatus;
    if (isTransferCanceled) return;

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

      if (!isTransferCanceled) actions.sendNextChunk();
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

  /**
   * Handles the cancellation of the file transfer by the recipient.
   * Updates the transfer status and displays an error message.
   *
   * @param _msg - The CancelRecipientTransferResponse message indicating the transfer was canceled.
   */
  const processCancelRecipientTransferMessage = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _msg: CancelRecipientTransferResponse,
  ) => {
    console.log("SATU");
    actions.setErrorMessage("Transfer aborted by receiver.");
    toast.error("Transfer aborted by receiver.");
    actions.setTransferStatus({ isTransferCanceled: true });
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
        if (readyState === WebSocket.OPEN && recipientId) {
          sendJsonMessage({
            type: "cancelSenderTransfer",
            recipientId,
          });
        }
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
