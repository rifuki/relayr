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
  const receiverWebSocket = useReceiverWebSocket();

  const { closeConnection: closeSenderConnection } = senderWebSocket;
  const { closeConnection: closeReceiverConnection } = receiverWebSocket;

  const {
    transferShareLink,
    recipientId,
    isSenderUploading,
    isSenderCompleted,
  } = useFileSenderStore(
    useShallow((s) => ({
      transferShareLink: s.transferShareLink,
      recipientId: s.transferConnection.recipientId,
      isSenderUploading: s.transferStatus.isTransferring,
      isSenderCompleted: s.transferStatus.isTransferCompleted,
    })),
  );
  const senderActions = useFileSenderActions();

  const { isConnected, isReceiverDownloading, isReceiverCompleted } =
    useFileReceiverStore(
      useShallow((s) => ({
        isConnected: s.transferConnection.isConnected,
        isReceiverDownloading: s.transferStatus.isTransferring,
        isReceiverCompleted: s.transferStatus.isTransferCompleted,
      })),
    );
  const receiverActions = useFileReceiverActions();

  useEffect(() => {
    setIsOnline(navigator.onLine);
  }, [setIsOnline]);

  useEffect(() => {
    function handleOffline() {
      setIsOnline(false);
      if (
        (transferShareLink || recipientId || isSenderUploading) &&
        !isSenderCompleted
      ) {
        senderActions.clearTransferState();
        senderActions.setTransferShareLink(null);
        senderActions.setTransferConnection({
          senderId: null,
          recipientId: null,
        });
        senderActions.setTransferStatus({
          isTransferring: false,
          isTransferError: true,
          isTransferCanceled: false,
          isTransferCompleted: false,
        });
      }

      if ((isConnected || isReceiverDownloading) && !isReceiverCompleted) {
        receiverActions.clearTransferState();
        receiverActions.setTransferConnection({
          recipientId: null,
          isConnected: false,
        });
        receiverActions.setTransferStatus({
          isTransferring: false,
          isTransferError: true,
          isTransferCanceled: false,
          isTransferCompleted: false,
        });
      }

      closeSenderConnection();
      closeReceiverConnection();
    }

    function handleOnline() {
      setIsOnline(true);
      toast.success("You are back online!", {
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
    transferShareLink,
    recipientId,
    isSenderUploading,
    isSenderCompleted,
    senderActions,
    isConnected,
    isReceiverDownloading,
    isReceiverCompleted,
    receiverActions,
    closeSenderConnection,
    closeReceiverConnection,
  ]);

  return null;
}
