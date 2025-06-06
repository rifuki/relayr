"use client";

// File Transfer Components
import SenderFlow from "@/components/file-transfer/sender/SenderFlow";
import TransferCardLayout from "@/components/file-transfer/TransferCardLayout";

// Hooks
import { useFileSenderSocket } from "@/hooks/useFileSenderSocket";
import { useInitId } from "@/hooks/useInitId";

// State Management (Store)
import { useFileSenderStore } from "@/stores/useFileSenderStore";

/**
 * File Transfer Page for the Sender
 * This page initializes the file transfer process for the sender,
 * displaying the sender's flow and managing the connection state.
 *
 * @returns JSX.Element The sender's file transfer page component.
 */
export default function SenderPage() {
  useFileSenderSocket();

  const webSocketReadyState = useFileSenderStore(
    (state) => state.webSocketReadyState,
  );
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const { isTransferCompleted } = useFileSenderStore(
    (state) => state.transferStatus,
  );
  const errorMessage = useFileSenderStore((state) => state.errorMessage);
  const connectionId = useInitId("sender");

  const showConnectionStatus = !!transferShareLink || isTransferCompleted;

  return (
    <TransferCardLayout
      readyState={webSocketReadyState}
      errorMessage={errorMessage}
      connectionId={connectionId}
      showConnectionStatus={showConnectionStatus}
    >
      <SenderFlow />
    </TransferCardLayout>
  );
}
