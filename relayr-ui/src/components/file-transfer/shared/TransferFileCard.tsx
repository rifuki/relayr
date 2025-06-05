// External Libraries
import {
  ArchiveIcon,
  FileAudioIcon,
  FileIcon,
  FileTextIcon,
  FileVideoIcon,
  ImageIcon,
} from "lucide-react";

// Utility functions for classnames and file size formatting
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/utils/file";

// Types
import { FileMetadata } from "@/types/file";

// Props interface for TransferFileCard component
interface FileCardProps {
  className?: string;
  fileMetadata: FileMetadata;
}

/**
 * TransferFileCard component displays a card with file metadata including name, type, and size.
 * It uses icons to represent different file types and formats the file size into a human-readable string.
 *
 * @param {FileCardProps} props - Component props containing file metadata and optional className.
 * @return JSX.Element - A card UI element displaying file information.
 */
export default function TransferFileCard({
  className,
  fileMetadata,
}: FileCardProps) {
  // Extract the general file type (e.g., image, video, audio) from MIME type
  const fileType = fileMetadata.type.split("/")[0];

  // Format the file size into a readable string (e.g., "1.2 MB")
  const fileSize = formatFileSize(fileMetadata.size);

  return (
    <div
      className={cn(
        "w-full p-4 rounded-lg border",
        "hover:bg-primary/10 dark:bg-input/30 hover:dark:bg-secondary/10 transition-colors",
        "cursor-pointer",
        className,
      )}
    >
      {/* Container for file icon and file details */}
      <div className="flex items-center space-x-4">
        {/* Icon container, preventing shrinking */}
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {getFileIcon(fileType)}
          </div>
          {/* Icon container, preventing shrinking end */}
        </div>

        {/* File details section */}
        <div className="flex-grow min-h-0 overflow-hidden">
          <div className="flex flex-col justify-center">
            {/* File name with truncation in case it's too long */}
            <h3 className="text-sm font-medium text-card-foreground truncate max-w-sm">
              {fileMetadata.name}
            </h3>

            {/* File type and file size */}
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/70 mr-2" />
              {/* File type label */}
              <span className="truncate">
                {getFileTypeLabel(fileMetadata.type)}
              </span>
              {/* Separator between file type and file size */}
              <span className="mx-1">•</span>
              {/* Formatted file size */}
              <span>{fileSize}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Container for file icon and file details */}

      {/* Container for file icon and file details end */}
    </div>
  );
}

// Return the appropriate icon component based on the file type
function getFileIcon(type: string) {
  switch (type) {
    case "image":
      return <ImageIcon className="h-5 w-5 text-primary/80" />;
    case "video":
      return <FileVideoIcon className="h-5 w-5 text-primary/80" />;
    case "audio":
      return <FileAudioIcon className="h-5 w-5 text-primary/80" />;
    case "text":
      return <FileTextIcon className="h-5 w-5 text-primary/80" />;
    case "application":
      return <ArchiveIcon className="h-5 w-5 text-primary/80" />;
    default:
      return <FileIcon className="h-5 w-5 text-primary/80" />;
  }
}

// Return a human-readable label for the file type based on MIME type
function getFileTypeLabel(mimeType: string) {
  const parts = mimeType.split("/");
  if (parts.length !== 2) return "unknown";

  const type = parts[0];
  const subtype = parts[1];

  switch (type) {
    case "image":
    case "video":
    case "audio":
    case "text":
      // Capitalize first letter of subtype
      return `${subtype.charAt(0).toUpperCase()}${subtype.slice(1)}`;

    case "application":
      // Special cases for common application subtypes
      if (subtype === "pdf") return "PDF";
      if (
        subtype.includes("zip") ||
        subtype.includes("rar") ||
        subtype.includes("tar")
      )
        return "Archive";
      if (subtype.includes("word") || subtype === "msword") return "Word";
      if (subtype.includes("excel") || subtype.includes("spreadsheet"))
        return "Spreadsheet";
      if (subtype.includes("presentation") || subtype.includes("powerpoint"))
        return "Presentation";
      return `${subtype.charAt(0).toUpperCase()}${subtype.slice(1)}`;

    default:
      return "File";
  }
}
