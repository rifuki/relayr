import { copyToClipboard } from "@/lib/utils";
import { FileMetadata } from "@/types/file";
import {
  CheckIcon,
  CloudLightningIcon,
  CopyIcon,
  Loader2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import FileCard from "../FileCard";
import { TextShimmer } from "../../../components/motion-primitives/text-shimmer";

interface WaitingForRecipientProps {
  fileMetadata: FileMetadata;
  transferFileShareLink: string;
  handleCloseWebSocketConnection: () => void;
}

export default function WaitingForRecipient({
  fileMetadata,
  transferFileShareLink,
  handleCloseWebSocketConnection,
}: WaitingForRecipientProps) {
  const [isShareLinkCopied, setIsShareLinkCopied] = useState<boolean>(false);

  const handleCopyShareLink = async () => {
    if (!transferFileShareLink) {
      toast.error("Something went wrong while generating the link.");
      return;
    }
    const res = await copyToClipboard(transferFileShareLink);
    if (res) {
      toast.success("Copied to clipboard");
    } else {
      toast.error("Failed to copy the share link.");
    }

    setIsShareLinkCopied(res);
    setTimeout(() => setIsShareLinkCopied(false), 1500);
  };

  return (
    <div className="flex flex-col items-center space-y-5">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Waiting for Recipient</h1>
        <p className="text-sm text-muted-foreground">
          Share this link with the recipient and wait for the to connect
        </p>
      </div>

      <CloudLightningIcon className="w-10 h-10 my-10" />

      <div className="w-full flex flex-col items-center space-y-5">
        <Badge className="p-2 bg-primary/90">
          Recipient ID: <Loader2Icon className="animate-spin" />
        </Badge>

        <div className="w-full flex gap-2">
          <Input value={transferFileShareLink} className="w-full" readOnly />
          <Button
            onClick={handleCopyShareLink}
            size="icon"
            variant="secondary"
            disabled={isShareLinkCopied}
          >
            {isShareLinkCopied ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        <FileCard fileMetadata={fileMetadata} />
      </div>

      <div className="w-full flex flex-col space-y-3 mt-2">
        <TextShimmer className="text-center mb-5" duration={1}>
          Waiting for the recipient to connect...
        </TextShimmer>
        <Button
          onClick={handleCloseWebSocketConnection}
          variant="destructive"
          className="w-full"
        >
          Stop Sharing
        </Button>
      </div>
    </div>
  );
}
