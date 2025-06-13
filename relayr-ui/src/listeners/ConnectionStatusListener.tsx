"use client";

// React
import { useEffect } from "react";

// External Libraries
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

// State Management (Store)
import { useConnectionStore } from "@/stores/useConnectionStore";

// Context Providers
import { useSenderWebSocket } from "@/providers/SenderWebSocketProvider";
import { useReceiverWebSocket } from "@/providers/ReceiverWebSocketProvider";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";
import {
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";

export default function ConnectionStatusListener() {
  const setIsOnline = useConnectionStore((state) => state.setIsOnline);

  const senderWebSocket = useSenderWebSocket();
  if (!senderWebSocket)
    throw new Error(
      "Sender WebSocket is not initialized. Please ensure the SenderWebSocketProvider is set up correctly. ",
    );
  const receiverWebSocket = useReceiverWebSocket();
  if (!receiverWebSocket)
    throw new Error(
      "Receiver WebSocket is not initialized. Please ensure the ReceiverWebSocketProvider is set up correctly.",
    );

  const { closeConnection: closeSenderConnection } = senderWebSocket;
  const { closeConnection: closeReceiverConnection } = receiverWebSocket;
  const { recipientId, isSenderTransferring } = useFileSenderStore(
    useShallow((s) => ({
      recipientId: s.transferConnection.recipientId,
      isSenderTransferring: s.transferStatus.isTransferring,
    })),
  );
  const senderActions = useFileSenderActions();

  const { isConnected, isRecipientTransferring } = useFileReceiverStore(
    useShallow((s) => ({
      isConnected: s.transferConnection.isConnected,
      isRecipientTransferring: s.transferStatus.isTransferring,
    })),
  );
  const receiverActions = useFileReceiverActions();

  useEffect(() => {
    setIsOnline(navigator.onLine);
  }, [setIsOnline]);

  useEffect(() => {
    function handleOffline() {
      setIsOnline(false);
      if (!recipientId || isSenderTransferring) {
        senderActions.clearTransferState();
        senderActions.setTransferShareLink(null);
        senderActions.setTransferConnection({
          senderId: null,
          recipientId: null,
        });
      }

      if (!isConnected || isRecipientTransferring) {
        receiverActions.clearTransferState();
        receiverActions.setTransferConnection({
          recipientId: null,
          isConnected: false,
        });
      }
      closeSenderConnection();
      closeReceiverConnection();
    }

    function handleOnline() {
      setIsOnline(true);
      toast.success("Connection Restored. Refresh this page", {
        duration: 3000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    }
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [
    setIsOnline,
    isConnected,
    isSenderTransferring,
    senderActions,
    recipientId,
    isRecipientTransferring,
    receiverActions,
    closeSenderConnection,
    closeReceiverConnection,
  ]);

  return null;
}
