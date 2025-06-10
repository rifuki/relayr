"use client";

// React and Nexts.js
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// File Transfer Components
import { ReceiverFlow } from "@/components/file-transfer/receiver";
import TransferCardLayout from "@/components/file-transfer/TransferCardLayout";

// Hooks
import { useFileReceiverSocket } from "@/hooks/useFileReceiverSocket";
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

export default function ReceivePageContent() {
  // Get the sender ID from the URL query parameters
  const senderIdFromQuery = useSearchParams().get("id");
  // Initialize a unique connection ID for the receiver
  const connectionId = useInitId("receiver");

  // Establish and manage WebSocket connection for the receiver
  useFileReceiverSocket();

  // Read state values from the store
  const webSocketReadyState = useFileReceiverStore(
    (state) => state.webSocketReadyState,
  );
  const errorMessage = useFileReceiverStore((state) => state.errorMessage);
  const lastValidSenderId = useFileReceiverStore(
    (state) => state.lastValidSenderId,
  );
  const { isTransferCompleted } = useFileReceiverStore(
    (state) => state.transferStatus,
  );
  const actions = useFileReceiverActions();

  // Determine the sender ID to use: either from the query or the last valid one stored
  const senderId = senderIdFromQuery || lastValidSenderId;

  // Fetch file metadata from backend using the sender ID
  const {
    data,
    isLoading: isFetchingFileMeta,
    error,
  } = useRelayFileMetadata(senderId ?? "");

  // Reset state to indicate the receiver flow hasn't started yet
  useEffect(() => {
    actions.setIsReceiverFlowActive(false);
  }, [actions]);

  // When metadata is successfully fetched, update store with metadata and connection info
  useEffect(() => {
    if (senderId && data) {
      actions.setFileMetadata(data);
      actions.setTransferConnection({ senderId });
    }
  }, [senderId, data, actions]);

  // Handle invalid or missing sender ID
  if (!senderId) return <MissingSenderId />;
  // Show error state if file metadata failed to fetch
  if (error && !isTransferCompleted)
    return <FileMetaError message={error.message} />;
  // Show loading state while fetching metadata
  if (isFetchingFileMeta) return <FileMetaLoading />;

  return (
    <TransferCardLayout
      readyState={webSocketReadyState}
      errorMessage={errorMessage}
      connectionId={connectionId}
    >
      <ReceiverFlow />
    </TransferCardLayout>
  );
}
