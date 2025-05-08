import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TransferHeader from "@/components/TransferHeader";
import FileCard from "@/components/FileCard";
import { FileCheck } from "lucide-react";
import {
  useFileSenderActions,
  useFileSenderStore,
  useWebSocketHandlers,
} from "@/stores/useFileSenderStore";

export default function TransferCompleted() {
  const { recipientId } = useFileSenderStore(
    (state) => state.transferConnection,
  );
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );

  const { getWebSocket } = useWebSocketHandlers();
  const actions = useFileSenderActions();

  const handleStartNewTransfer = () => {
    actions.setTransferConnection({ recipientId: null });
    actions.resetTransferStatus();
  };

  const handleSelectDifferentFile = () => {
    const ws = getWebSocket?.();
    if (!ws) {
      actions.setErrorMessage("WebSocket is not available.");
      return;
    }

    if (ws.readyState === WebSocket.OPEN) {
      actions.setWebSocketUrl(null);
      ws.close(
        1000,
        "Sender file selection reset, closing WebSocket connection.",
      );
    }

    actions.setFile(null);
    actions.setTransferConnection({ senderId: null, recipientId: null });
    actions.setTransferShareLink(null);
    actions.resetTransferStatus();
  };

  if (!fileMetadata || !transferShareLink) return;

  return (
    <div className="flex flex-col items-center space-y-5">
      <TransferHeader
        title="Transfer Successful"
        description="Your file has been successfully transferred"
      />

      <FileCheck className="h-10 w-10 my-10" />

      <div className="w-full flex flex-col items-center space-y-5">
        <Badge className="p-2 bg-primary/90">Recipient ID: {recipientId}</Badge>
        <FileCard fileMetadata={fileMetadata} />
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span>Transfer completed</span>
            <span>100%</span>
          </div>
          <Progress value={100} />
        </div>
        <Input value={transferShareLink} className="w-full" readOnly disabled />
      </div>

      <div className="w-full flex flex-col space-y-3 mt-2">
        <Button onClick={handleStartNewTransfer} className="w-full">
          Start New Transfer
        </Button>
        <Button
          onClick={handleSelectDifferentFile}
          variant="ghost"
          className="w-full"
        >
          Select Different File
        </Button>
      </div>
    </div>
  );
}
