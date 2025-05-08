import { CloudLightningIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FileCard from "@/components/FileCard";
import { Button } from "@/components/ui/button";
import SenderProgressBar from "@/components/SenderProgressBar";
import TransferHeader from "@/components/TransferHeader";
import ShareableLinkInput from "@/components/ShareableLinkInput";
import { CHUNK_SIZE } from "@/lib/constants";
import {
  CancelSenderReadyRequest,
  cancelSenderTransferRequest,
} from "@/types/webSocketMessages";
import {
  useFileSenderActions,
  useFileSenderStore,
  useWebSocketHandlers,
} from "@/stores/useFileSenderStore";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

export default function ReadyToTransfer() {
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const { recipientId } = useFileSenderStore(
    (state) => state.transferConnection,
  );
  const file = useFileSenderStore((state) => state.file);
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const { isTransferring, isRecipientComplete } = useFileSenderStore(
    (state) => state.transferStatus,
  );

  const { sendJsonMessage } = useWebSocketHandlers();
  const actions = useFileSenderActions();

  if (!file || !sendJsonMessage) return;

  const handleSendFile = () => {
    if (!file || !recipientId) {
      const errorMsg = "Missing file or recipient";
      actions.setErrorMessage(errorMsg);
      console.error(errorMsg);
    }

    actions.resetTransferStatus();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    actions.setTransferStatus({ totalChunks });

    actions.sendNextChunk();
  };

  const handleCancelSenderReady = () => {
    sendJsonMessage({
      type: "cancelSenderReady",
    } satisfies CancelSenderReadyRequest);
    actions.setTransferConnection({ recipientId: null });
  };

  const handleCancelSenderTransfer = () => {
    sendJsonMessage({
      type: "cancelSenderTransfer",
    } satisfies cancelSenderTransferRequest);
    actions.resetTransferStatus();
  };

  if (!transferShareLink || !fileMetadata) return;

  return (
    <div className="flex flex-col items-center space-y-5">
      <TransferHeader
        title="Ready to Transfer"
        description="Recipient connected. You can now transfer the file"
      />

      <CloudLightningIcon className="h-10 w-10 my-10" />

      <div className="w-full flex flex-col items-center space-y-5">
        <Badge className="p-2 bg-primary/90">Recipient ID: {recipientId}</Badge>

        <ShareableLinkInput value={transferShareLink} />

        <FileCard fileMetadata={fileMetadata} />
      </div>

      <div className="w-full space-y-2">
        <SenderProgressBar />
      </div>

      <div className="w-full flex flex-col space-y-3 mt-2">
        {!isTransferring && !isRecipientComplete ? (
          <Button onClick={handleSendFile} className="w-full">
            Start Transfer
          </Button>
        ) : (
          <TextShimmer className="text-center" duration={1}>
            ⚠️ Transfer in progress — stay on this page.
          </TextShimmer>
        )}
        {!isTransferring && !isRecipientComplete ? (
          <Button
            onClick={handleCancelSenderReady}
            variant="destructive"
            className="w-full"
          >
            Cancel Transfer Setup
          </Button>
        ) : (
          <Button
            onClick={handleCancelSenderTransfer}
            variant="destructive"
            className="w-full"
          >
            Abort Trasnfer
          </Button>
        )}
      </div>
    </div>
  );
}
