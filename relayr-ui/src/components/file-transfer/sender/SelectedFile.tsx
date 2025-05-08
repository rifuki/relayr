import { useState } from "react";
import { Button } from "@/components/ui/button";
import FileCard from "@/components/FileCard";
import TransferHeader from "@/components/TransferHeader";
import { WS_RELAY_API_URL } from "@/lib/api";
import {
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";

export default function SelectedFile() {
  const file = useFileSenderStore((state) => state.file);
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);

  const actions = useFileSenderActions();

  const [isGenerateLinkLoading, setIsGenerateLinkLoading] = useState(false);

  if (!fileMetadata) return;

  const handleGenerateTransferShareLink = () => {
    setIsGenerateLinkLoading(true);
    if (!file || !fileMetadata) {
      return { errorMessage: "File or file metadata is missing." };
    }

    actions.resetTransferStatus();
    actions.setWebSocketUrl(WS_RELAY_API_URL);
    setIsGenerateLinkLoading(false);
  };

  const handleUnselectFile = () => {
    actions.setFile(null);
  };

  return (
    <div className="flex flex-col items-center space-y-5">
      <TransferHeader
        title="File Selected"
        description="Ready to generate a transfer link "
      />

      <FileCard fileMetadata={fileMetadata} />

      <div className="w-full flex flex-col space-y-3 mt-2">
        <Button
          onClick={() => handleGenerateTransferShareLink()}
          disabled={isGenerateLinkLoading}
          className="w-full"
        >
          Generate Transfer Link
        </Button>
        <Button
          onClick={handleUnselectFile}
          variant="destructive"
          className="w-full"
        >
          Remove File
        </Button>
      </div>
    </div>
  );
}
