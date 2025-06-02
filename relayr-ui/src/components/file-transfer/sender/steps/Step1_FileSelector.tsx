import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";

import { FileIcon, Loader2Icon } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import TransferHeader from "@/components/TransferHeader";
import { handlePrepareDummyFile, isFolderLike } from "@/lib/utils";
import { useFileSenderActions } from "@/stores/useFileSenderStore";

export default function Step1_FileSelector() {
  const actions = useFileSenderActions();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files?.length === 0) return;

    const file = e.target.files[0];
    setIsFileLoading(true);

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };
    reader.onload = () => {
      setIsFileLoading(false);
      setProgress(100);
      actions.setErrorMessage(null);
      actions.setFile(file);
    };
    reader.onerror = () => {
      setIsFileLoading(false);
      actions.setErrorMessage("File read error");
      console.error("File read error", reader.error);
    };
    reader.readAsArrayBuffer(e.target.files[0]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    setIsFileLoading(true);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    const item = items[0];
    const itemWithEntry = item as DataTransferItem & {
      webkitGetAsEntry?: () => FileSystemEntry;
    };
    const entry = itemWithEntry.webkitGetAsEntry?.();
    if (entry && entry.isDirectory) {
      actions.setErrorMessage(
        "Cannot upload folders. Please select a single file.",
      );
      return;
    }

    const droppedFile = e.dataTransfer.files[0];
    if (isFolderLike(droppedFile)) {
      actions.setErrorMessage(
        "Cannot upload folders. Please select a single file.",
      );
      return;
    }

    actions.setErrorMessage(null);
    actions.setFile(droppedFile);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = () => {
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationComplete(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TransferHeader
          title="Send a File"
          description="Select a file to share it securely via WebSocket"
        />
      </motion.div>

      <motion.div
        className={`w-full p-20 border-4 border-dashed ${isDragging ? "border-primary" : "border-border/80"} ${isDragging ? "bg-secondary/70" : "hover:bg-secondary/50"} flex flex-col justify-center items-center space-y-5 ${!isFileLoading && "cursor-pointer"}`}
        onClick={() => !isFileLoading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.2,
        }}
        whileHover={isAnimationComplete ? { scale: isDragging ? 1 : 1.03 } : {}}
        whileTap={!isFileLoading ? { scale: 0.88 } : {}}
        style={{ minWidth: "300px" }}
      >
        <input
          type="file"
          onChange={handleFileSelect}
          disabled={isFileLoading}
          ref={fileInputRef}
          className="hidden"
        />

        <motion.div
          className="w-16 h-16 mx-auto rounded-xl bg-secondary/80 flex items-center justify-center"
          animate={
            isFileLoading
              ? { rotate: 360 }
              : {
                  scale: isDragging ? 1.2 : 1,
                  rotate: isDragging ? [0, -10, -10, -10, 0] : 0,
                }
          }
          transition={
            isFileLoading
              ? { repeat: Infinity, duration: 1, ease: "linear" }
              : {
                  scale: { type: "spring", stiffness: 300, damping: 25 },
                  rotate: { duration: 0.5, ease: "easeInOut" },
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 1,
                }
          }
          whileHover={
            isAnimationComplete && !isFileLoading
              ? {
                  scale: isDragging ? 1.2 : 1.5,
                  rotate: isDragging ? [0, 0, 0, 0] : [0, 5, -5, 0],
                }
              : {}
          }
        >
          {isFileLoading ? (
            <Loader2Icon className="animate-spin text-primary" />
          ) : (
            <FileIcon className="h-10 w-10" />
          )}
        </motion.div>

        <motion.div
          className="text-center"
          animate={{ y: isDragging ? -5 : 0 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <p className="text-base font-medium">
            {isFileLoading
              ? `Processing file... ${progress}%`
              : isDragging
                ? "Release to upload"
                : "Drag and drop your file here"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isDragging ? "" : "or click to browse"}
          </p>
        </motion.div>
      </motion.div>

      {process.env.NODE_ENV === "development" && (
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button
            onClick={() =>
              handlePrepareDummyFile(
                setIsFileLoading,
                actions.setFile,
                setProgress,
              )
            }
            disabled={isFileLoading}
            className="w-full my-2 cursor-pointer"
          >
            {isFileLoading ? (
              <TextShimmer duration={1}>{`${progress}%`}</TextShimmer>
            ) : (
              <>Prepare Dummy File</>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
