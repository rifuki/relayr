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

// Context Providers
import { useReceiverWebSocket } from "@/providers/ReceiverWebSocketProvider";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

// State Components
import MissingSenderId from "@/components/file-transfer/receiver/states/MissingSenderId";
import FileMetaError from "@/components/file-transfer/receiver/states/FileMetaError";
import FileMetaLoading from "@/components/file-transfer/receiver/states/FileMetaLoading";

export default function Receive() {
  const { readyState } = useReceiverWebSocket();

  // Get the sender ID from the URL query parameters
  const senderIdFromQuery = useSearchParams().get("id");
  // Initialize a unique connection ID for the receiver
  const connectionId = useInitId("receiver");

  // Read state values from the store
  const errorMessage = useFileReceiverStore((s) => s.errorMessage);
  const { isConnected } = useFileReceiverStore((s) => s.transferConnection);
  const {
    isTransferring,
    isTransferError,
    isTransferCanceled,
    isTransferCompleted,
  } = useFileReceiverStore((s) => s.transferStatus);
  const actions = useFileReceiverActions();

  // Determine the sender ID to use: either from the query or the last valid one stored
  const senderId = senderIdFromQuery;

  // Fetch file metadata from backend using the sender ID
  const {
    data,
    isLoading: isFetchingFileMeta,
    error,
  } = useRelayFileMetadata(senderId ?? "", {
    enabled:
      !isConnected &&
      !isTransferError &&
      !isTransferCanceled &&
      !isTransferring &&
      !isTransferCompleted,
  });

  // When metadata is successfully fetched, update store with metadata and connection info
  useEffect(() => {
    if (senderId && data) {
      actions.setFileMetadata(data);
      actions.setTransferConnection({ senderId });
    }
  }, [senderId, data, actions]);

  // Handle invalid or missing sender ID
  if (!senderId && !isConnected && !isTransferring && !isTransferCompleted)
    return <MissingSenderId />;
  // Show error state if file metadata failed to fetch
  if (error && !isConnected && !isTransferring && !isTransferCompleted)
    return <FileMetaError message={error.message} />;
  // Show loading state while fetching metadata
  if (isFetchingFileMeta) return <FileMetaLoading />;

  return (
    <TransferCardLayout
      readyState={readyState}
      errorMessage={errorMessage}
      connectionId={connectionId}
    >
      <ReceiverFlow />
    </TransferCardLayout>
  );
}
