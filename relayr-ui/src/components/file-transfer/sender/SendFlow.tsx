import FileSelector from "./FileSelector";
import SelectedFile from "./SelectedFile";
import WaitingForRecipient from "./WaitingForRecipient";
import ReadyToTransfer from "./ReadyToTransfer";
import TransferCompleted from "./TransferCompleted";
import { useFileSenderStore } from "@/stores/useFileSenderStore";

export default function SendFlow() {
  const file = useFileSenderStore((state) => state.file);
  const { senderId, recipientId } = useFileSenderStore(
    (state) => state.transferConnection,
  );
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const { isRecipientComplete } = useFileSenderStore(
    (state) => state.transferStatus,
  );
  console.log({
    file,
    senderId,
    recipientId,
    transferShareLink,
    isRecipientComplete,
  });

  {
    /* File selection state */
  }
  if (
    !file &&
    !senderId &&
    !transferShareLink &&
    !recipientId &&
    !isRecipientComplete
  ) {
    return <FileSelector />;
  }

  {
    /* File selected state */
  }
  if (
    file &&
    !senderId &&
    !transferShareLink &&
    !recipientId &&
    !isRecipientComplete
  ) {
    return <SelectedFile />;
  }

  {
    /* Waiting for recipient state */
  }
  if (
    file &&
    senderId &&
    transferShareLink &&
    !recipientId &&
    !isRecipientComplete
  ) {
    return <WaitingForRecipient />;
  }

  {
    /* Ready to transfer state */
  }
  if (
    file &&
    senderId &&
    transferShareLink &&
    recipientId &&
    !isRecipientComplete
  ) {
    return <ReadyToTransfer />;
  }

  {
    /* Transfer completed state */
  }
  if (
    file &&
    senderId &&
    transferShareLink &&
    recipientId &&
    isRecipientComplete
  ) {
    return <TransferCompleted />;
  }

  // Fallback (should never happen ideally)
  return (
    <p className="text-center text-sm text-muted-foreground">
      Invalid transfer state
    </p>
  );
}
