import { handlePrepareDummyFile, isFolderLike } from "@/lib/utils";
import { FileIcon } from "lucide-react";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Button } from "../ui/button";
import { TextShimmer } from "../../../components/motion-primitives/text-shimmer";

interface FileSelectorProps {
  setFile: (file: File) => void;
  setErrorMessage: (error: string | null) => void;
}

export default function FileSelector({
  setFile,
  setErrorMessage,
}: FileSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [dummyDownloadProgress, setDummyDownloadProgress] = useState(0);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files?.length === 0) return;

    setErrorMessage(null);
    setFile(e.target.files[0]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    const item = items[0];
    const itemWithEntry = item as DataTransferItem & {
      webkitGetAsEntry?: () => FileSystemEntry;
    };
    const entry = itemWithEntry.webkitGetAsEntry?.();
    if (entry && entry.isDirectory) {
      setErrorMessage("Cannot upload folders. Please select a single file.");
      return;
    }

    const droppedFile = e.dataTransfer.files[0];
    if (!isFolderLike(droppedFile)) {
      setErrorMessage("Cannot upload folders. Please select a single file.");
      return;
    }

    setErrorMessage(null);
    setFile(droppedFile);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  return (
    <div className="flex flex-col items-center space-y-5">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Send a File</h1>
        <p className="text-sm text-muted-foreground">
          Select a file to share it securely via WebSocket
        </p>
      </div>

      <div
        className="w-full p-20 border-4 border-dashed border-border/80 cursor-pointer hover:bg-secondary/50 flex flex-col justify-center items-center space-y-5"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDrag={handleDragOver}
      >
        <input
          type="file"
          onChange={handleFileSelect}
          ref={fileInputRef}
          className="hidden"
        />
        <div className="w-16 h-16 mx-auto rounded-xl bg-secondary/80 flex items-center justify-center">
          <FileIcon />
        </div>
        <div className="text-center">
          <p className="text-base font-medium">Drag and drop your file here</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
        </div>
      </div>

      <Button
        onClick={() =>
          handlePrepareDummyFile(
            setIsFileLoading,
            setFile,
            setDummyDownloadProgress,
          )
        }
        disabled={isFileLoading}
        className="w-full my-2"
      >
        {isFileLoading ? (
          <TextShimmer duration={1}>{`${dummyDownloadProgress} %`}</TextShimmer>
        ) : (
          <>Prepare Dummy File</>
        )}
      </Button>
    </div>
  );
}
