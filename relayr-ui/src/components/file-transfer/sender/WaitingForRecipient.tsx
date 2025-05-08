import { useState } from "react";
import { CloudLightningIcon, Loader2Icon } from "lucide-react";
import { Badge } from "@components/ui/badge";
import { Button } from "@/components/ui/button";
import FileCard from "@/components/FileCard";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import TransferHeader from "@/components/TransferHeader";
import ShareableLinkInput from "@/components/ShareableLinkInput";
import {
  useFileSenderActions,
  useFileSenderStore,
  useWebSocketHandlers,
} from "@/stores/useFileSenderStore";

export default function WaitingForRecipient() {
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const { senderId } = useFileSenderStore((state) => state.transferConnection);

  const { getWebSocket } = useWebSocketHandlers();
  const actions = useFileSenderActions();

  const [isLoading, setIsLoading] = useState(false);

  const handleStopSharing = () => {
    if (isLoading) return;

    setIsLoading(true);

    const ws = getWebSocket?.();
    if (!ws) {
      actions.setErrorMessage("WebSocket is not available.");
      setIsLoading(false);
      return;
    }

    ws.close(1000, "Sender canceled the transfer link");

    if (!transferShareLink || senderId) {
      actions.setErrorMessage("Transfer stopped, all data reset.");
    }

    setIsLoading(false);
  };

  if (!fileMetadata || !transferShareLink) return;

  return (
    <div className="flex flex-col items-center space-y-5">
      <TransferHeader
        title="Waiting for Recipient"
        description="Share this link with the recipient and wait for them to connect"
      />

      <CloudLightningIcon className="w-10 h-10 my-10" />

      <div className="w-full flex flex-col items-center space-y-5">
        <Badge className="p-2 bg-primary/90">
          Recipient ID: <Loader2Icon className="animate-spin" />
        </Badge>

        <ShareableLinkInput value={transferShareLink} />

        <FileCard fileMetadata={fileMetadata} />
      </div>

      <div className="w-full flex flex-col space-y-3 mt-2">
        <TextShimmer className="text-center mb-5" duration={1}>
          ⏳ Waiting for the recipient to connect...
        </TextShimmer>
        <Button
          onClick={handleStopSharing}
          disabled={isLoading}
          variant="destructive"
          className="w-full"
        >
          Stop Sharing
        </Button>
      </div>
    </div>
  );
}
