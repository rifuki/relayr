"use client";

// React and Nexts.js
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// File Transfer Components
import ReceiverFlow from "@/components/file-transfer/receiver/ReceiverFlow";
import TransferCardLayout from "@/components/file-transfer/TransferCardLayout";

// Hooks
import { UseFileReceiverSocket } from "@/hooks/useFileReceiverSocket";
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
  const senderId = useSearchParams().get("id");
  const connectionId = useInitId("receiver");

  const { readyState } = UseFileReceiverSocket();
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
      readyState={readyState}
      errorMessage={errorMessage}
      idLabel="Receiver"
      connectionId={connectionId}
    >
      <ReceiverFlow />
    </TransferCardLayout>
  );
}
