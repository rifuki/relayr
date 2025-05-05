import { FileMetadata } from "@/types/file";
import FileCard from "../FileCard";
import { Button } from "../ui/button";

interface SelectedFileProps {
  file: File;
  setFile: (file: File | null) => void;
  fileMetadata: FileMetadata;
  handleGenerateTransferLink: (file: File, fileMetadata: FileMetadata) => void;
  isPageLoading: boolean;
}

export default function SelectedFile({
  file,
  setFile,
  fileMetadata,
  handleGenerateTransferLink,
  isPageLoading,
}: SelectedFileProps) {
  const handleUnselectFile = () => {
    setFile(null);
  };

  return (
    <div className="flex flex-col items-center space-y-5">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">File Selected</h1>
        <p className="text-sm text-muted-foreground">
          Ready to generate a transfer link
        </p>
      </div>

      <FileCard fileMetadata={fileMetadata} />

      <div className="w-full flex flex-col space-y-3 mt-2">
        <Button
          onClick={() => handleGenerateTransferLink(file, fileMetadata)}
          disabled={isPageLoading}
          className="w-full"
        >
          Generate Sender Link
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
