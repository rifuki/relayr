import { CloudLightningIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import FileCard from "../FileCard";
import { FileMetadata } from "@/types/file";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface ReadyToTransferProps {
  recipientId: string;
  transferFileShareLink: string;
  fileMetadata: FileMetadata;
  transferFileProgress: number;
  isTransferringFile: boolean;
  isTranferringFileComplete: boolean;
  handleSendFile: () => void;
  handleCancelSenderReady: () => void;
}

export default function ReadyToTransfer({
  recipientId,
  transferFileShareLink,
  fileMetadata,
  transferFileProgress,
  isTransferringFile,
  isTranferringFileComplete,
  handleSendFile,
  handleCancelSenderReady,
}: ReadyToTransferProps) {
  return (
    <div className="flex flex-col items-center space-y-5">
      <div className="text-center space-y-2">
        <p className="text-2xl font-bold">Ready to Transfer</p>
        <p className="text-sm text-muted-foreground">
          Recipient connected. You can now transfer the file
        </p>
      </div>

      <CloudLightningIcon className="h-10 w-10 my-10" />

      <div className="w-full flex flex-col items-center space-y-5">
        <Badge className="p-2 bg-primary/90">Recipient ID: {recipientId}</Badge>

        <Input value={transferFileShareLink} className="w-full" readOnly />

        <FileCard fileMetadata={fileMetadata} />
      </div>

      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            {isTransferringFile
              ? "Transferring file"
              : isTranferringFileComplete
                ? "Transfer completed"
                : "Click the button to start the transfer"}
          </span>
          {}
          <span>{transferFileProgress}%</span>
        </div>
        <Progress value={transferFileProgress} />
      </div>

      <div className="w-full flex flex-col space-y-3 mt-2">
        {!isTransferringFile && !isTranferringFileComplete && (
          <Button onClick={handleSendFile} className="w-full">
            Send File
          </Button>
        )}
        <Button
          onClick={handleCancelSenderReady}
          variant="destructive"
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
