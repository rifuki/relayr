// React
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";

// External Libraries
import { FileIcon, Loader2Icon } from "lucide-react";
import { motion } from "motion/react";

// Internal Components
import {
  type StepConfig as StepProps,
  StepHeaderSection,
  StepSectionWrapper,
} from "../../shared";

// Utilities
import { isFolderLike } from "@/utils/file";

// State Management (Store)
import { useFileSenderActions } from "@/stores/useFileSenderStore";

export default function Step1_FileSelector(props: StepProps) {
  const actions = useFileSenderActions();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [, setIsAnimationComplete] = useState(false);
  const [isWrapperHovered, setIsWrapperHovered] = useState(false);

  // Handles file selection (via input)
  const handleSelectFile = async (e: ChangeEvent<HTMLInputElement>) => {
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
      setProgress(100);
      actions.setErrorMessage(null); // Clear any previous error
      actions.clearTransferState();

      // avoid flicker
      setTimeout(() => {
        setIsFileLoading(false);
      }, 500);
      setTimeout(() => {
        actions.setFile(file); // Set the file to the store
      }, 1000);
    };
    reader.onerror = () => {
      setIsFileLoading(false);
      actions.setErrorMessage("File read error");
      console.error("File read error", reader.error);
    };
    reader.readAsArrayBuffer(e.target.files[0]); // Start reading file
  };

  // Handle file drop event (drag-and-drop)
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

    actions.setErrorMessage(null); // Clear any previous error
    actions.clearTransferState();

    // avoid flicker
    setTimeout(() => {
      setIsFileLoading(false);
    }, 500);
    setTimeout(() => {
      actions.setFile(droppedFile); // Set the file to the store
    }, 1000);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true); // Set dragging state to true
    setIsWrapperHovered(false); // Make sure wrapper hover is false
  };

  const handleDragEnter = () => {
    setIsDragging(true); // Set dragging state to true on entering
    setIsWrapperHovered(false); // Make sure wrapper hover is false
  };

  const handleDragLeave = () => {
    setIsDragging(false); // Set dragging state to false when leaving
    setIsWrapperHovered(false); // Make sure wrapper hover is false
  };

  // Handle animation completion after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationComplete(true);
    }, 500); // Delay animation completion by 500ms

    return () => clearTimeout(timer); // Clean up the timer
  }, []);

  return (
    <StepSectionWrapper variants={{}}>
      {/* Render the header section with title and description  */}
      <StepHeaderSection
        title={props.header.title}
        description={props.header.description}
      />

      {/* Render the transfer header with icon and title */}
      <motion.div
        className={`w-full p-20 border-4 border-dashed ${isDragging ? "border-primary bg-secondary/70" : "border-border/80 hover:bg-secondary/50"} gap-5 flex flex-col justify-center items-center ${isFileLoading ? "cursor-none" : "cursor-pointer"}`}
        onClick={() => !isFileLoading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onHoverStart={() => setIsWrapperHovered(true)}
        onHoverEnd={() => setIsWrapperHovered(false)}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.5,
        }}
        style={{ minWidth: "300px" }}
      >
        {/* Hidden file input for file selection */}
        <input
          type="file"
          onChange={handleSelectFile}
          disabled={isFileLoading}
          ref={fileInputRef}
          className="hidden"
        />

        {/* Render the file icon and loading spinner */}
        <motion.div
          className="w-16 h-16 mx-auto rounded-xl bg-secondary/80 flex items-center justify-center"
          animate={{
            scale: isFileLoading
              ? 1
              : isDragging
                ? 1.2
                : isWrapperHovered
                  ? 1.3
                  : 1,
            rotate: isFileLoading
              ? 360
              : isDragging
                ? [0, -20, -20, -20, 0]
                : isWrapperHovered
                  ? [0, 20, -20, 0]
                  : 0,
          }}
          transition={{
            duration: isFileLoading ? 1 : 1.5,
            ease: isFileLoading ? "linear" : undefined,
            scale: { type: "spring", stiffness: 300, damping: 25 },
            rotate: { duration: 0.5, ease: "easeInOut" },
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 1,
          }}
        >
          {isFileLoading ? (
            <Loader2Icon className="animate-spin text-primary" />
          ) : (
            <FileIcon className="h-8 w-8" />
          )}
        </motion.div>
        {/* Render the file icon and loading spinner end */}

        {/* Render the text instructions */}
        <motion.div
          className="text-center"
          animate={{ y: isDragging ? 15 : isWrapperHovered ? 10 : 0 }}
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
            {isDragging ? "\u00A0" : "or click to browse"}
          </p>
        </motion.div>

        {/* Render the text instructions end */}
      </motion.div>
      {/* Render the transfer header with icon and title end */}
    </StepSectionWrapper>
  );
}
