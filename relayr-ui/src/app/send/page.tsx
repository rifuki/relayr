"use client";

// File Transfer Components
import SenderFlow from "@/components/file-transfer/sender/SenderFlow";
import TransferCardLayout from "@/components/file-transfer/TransferCardLayout";

// Hooks
import { useFileSenderSocket } from "@/hooks/useFileSenderSocket";
import { useInitId } from "@/hooks/useInitId";

// State Management (Store)
import { useFileSenderStore } from "@/stores/useFileSenderStore";

export default function SendPage() {
  const { readyState } = useFileSenderSocket();
  const errorMessage = useFileSenderStore((state) => state.errorMessage);
  const connectionId = useInitId("sender");

  return (
    <TransferCardLayout
      readyState={readyState}
      errorMessage={errorMessage}
      idLabel="Sender"
      connectionId={connectionId}
    >
      <SenderFlow />
    </TransferCardLayout>
  );
}
