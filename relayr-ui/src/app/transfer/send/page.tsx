"use client";

// File Transfer Components
import SenderFlow from "@/components/file-transfer/sender/SenderFlow";
import TransferCardLayout from "@/components/file-transfer/TransferCardLayout";

// Hooks
import { useInitId } from "@/hooks/useInitId";

// Context Providers
import { useSenderWebSocket } from "@/providers/SenderWebSocketProvider";

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
  const senderWebSocket = useSenderWebSocket();
  if (!senderWebSocket)
    throw new Error("SenderWebSocketProvider is not initialized");

  const file = useFileSenderStore((state) => state.file);
  const { isTransferCompleted } = useFileSenderStore(
    (state) => state.transferStatus,
  );
  const errorMessage = useFileSenderStore((state) => state.errorMessage);
  const connectionId = useInitId("sender");

  const showConnectionStatus = !!file || isTransferCompleted;

  return (
    <TransferCardLayout
      readyState={senderWebSocket.readyState}
      errorMessage={errorMessage}
      connectionId={connectionId}
      showConnectionStatus={showConnectionStatus}
    >
      <SenderFlow />
    </TransferCardLayout>
  );
}
