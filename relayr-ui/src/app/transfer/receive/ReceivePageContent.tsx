"use client";

// React and Nexts.js
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// File Transfer Components
import { ReceiverFlow } from "@/components/file-transfer/receiver";
import TransferCardLayout from "@/components/file-transfer/TransferCardLayout";

// Hooks
import { useInitId } from "@/hooks/useInitId";
import { useRelayFileMetadata } from "@/hooks/query/useRelay";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

// State Components
import MissingSenderId from "@/components/file-transfer/receiver/states/MissingSenderId";
import FileMetaError from "@/components/file-transfer/receiver/states/FileMetaError";
import FileMetaLoading from "@/components/file-transfer/receiver/states/FileMetaLoading";
import { useReceiverWebSocket } from "@/providers/ReceiverWebSocketProvider";

export default function ReceivePageContent() {
  const receiverWebSocket = useReceiverWebSocket();
  if (!receiverWebSocket)
    throw new Error("Receiver WebSocket is not available");

  // Get the sender ID from the URL query parameters
  const senderIdFromQuery = useSearchParams().get("id");
  // Initialize a unique connection ID for the receiver
  const connectionId = useInitId("receiver");

  // Read state values from the store
  const errorMessage = useFileReceiverStore((s) => s.errorMessage);
  const { isTransferring, isTransferCompleted } = useFileReceiverStore(
    (s) => s.transferStatus,
  );
  const actions = useFileReceiverActions();

  // Determine the sender ID to use: either from the query or the last valid one stored
  const senderId = senderIdFromQuery;

  // Fetch file metadata from backend using the sender ID
  const {
    data,
    isLoading: isFetchingFileMeta,
    error,
  } = useRelayFileMetadata(senderId ?? "", {
    enabled: !isTransferring && !isTransferCompleted,
  });

  // When metadata is successfully fetched, update store with metadata and connection info
  useEffect(() => {
    if (senderId && data) {
      actions.setFileMetadata(data);
      actions.setTransferConnection({ senderId });
    }
  }, [senderId, data, actions]);

  // Handle invalid or missing sender ID
  if (!senderId && !isTransferring && !isTransferCompleted)
    return <MissingSenderId />;
  // Show error state if file metadata failed to fetch
  if (error && !isTransferring && !isTransferCompleted)
    return <FileMetaError message={error.message} />;
  // Show loading state while fetching metadata
  if (isFetchingFileMeta) return <FileMetaLoading />;

  return (
    <TransferCardLayout
      readyState={receiverWebSocket.readyState}
      errorMessage={errorMessage}
      connectionId={connectionId}
    >
      <ReceiverFlow />
    </TransferCardLayout>
  );
}
