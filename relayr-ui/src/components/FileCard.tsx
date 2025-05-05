import { cn } from "@/lib/utils";
import { FileMetadata } from "@/types/file";
import {
  ArchiveIcon,
  FileAudioIcon,
  FileIcon,
  FileTextIcon,
  FileVideoIcon,
  ImageIcon,
} from "lucide-react";

interface FileCardProps {
  fileMetadata: FileMetadata;
  className?: string;
}

export default function FileCard({ fileMetadata, className }: FileCardProps) {
  const fileType = fileMetadata.type.split("/")[0];
  const fileSize = formatFileSize(fileMetadata.size);

  return (
    <div
      className={cn(
        "w-full p-4 rounded-lg border",
        "border-border bg-card",
        className,
      )}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            {getFileIcon(fileType)}
          </div>
        </div>

        <div className="flex-grow min-h-0 overflow-hidden">
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-card-foreground truncate max-w-sm">
              {fileMetadata.name}
            </h3>
            <div className="flex items-center text-xs text-muted-foreground space-x-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/70 mr-2"></div>
              {getFileTypeLabel(fileMetadata.type)} • {fileSize}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileTypeLabel(mimeType: string) {
  const parts = mimeType.split("/");
  if (parts.length !== 2) return "unknown";

  const type = parts[0];
  const subtype = parts[1];

  switch (type) {
    case "image":
      return subtype.toUpperCase();
    case "video":
      return subtype.toUpperCase();
    case "audio":
      return subtype.toUpperCase();
    case "text":
      return `${subtype.charAt(0).toUpperCase()}${subtype.slice(1)}`;
    case "application":
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
