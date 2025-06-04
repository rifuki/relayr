"use client";

// React and Nexts.js
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// File Transfer Components
import ReceiverFlow from "@/components/file-transfer/receiver/ReceiverFlow";
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

/**
 * ReceivePageContent Component
 * Handles the file receiving process by fetching metadata and managing the connection.
 *
 * @returns JSX.Element The content for the receive page.
 */
export default function ReceivePageContent() {
  const senderId = useSearchParams().get("id");
  const connectionId = useInitId("receiver");

  useFileReceiverSocket();
  const webSocketReadyState = useFileReceiverStore(
    (state) => state.webSocketReadyState,
  );
  const errorMessage = useFileReceiverStore((state) => state.errorMessage);
  const actions = useFileReceiverActions();

  const {
    data,
    isLoading: isFetchingFileMeta,
    error,
  } = useRelayFileMetadata(senderId ?? "");

  useEffect(() => {
    if (senderId && data) {
      actions.setFileMetadata(data);
      actions.setTransferConnection({ senderId });
    }
  }, [senderId, data, actions]);

  if (!senderId) return <MissingSenderId />;
  if (error) return <FileMetaError message={error.message} />;
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
