// External Libraries
import axios, { AxiosProgressEvent } from "axios";

// Utilities for CSS class manipulation
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility Function to Combine and Merge Tailwind Classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Checks if the file is folder-like (either zero size with no type or has a relative path)
export function isFolderLike(file: File): boolean {
  const fileWithPath = file as File & { webkitRelativePath?: string };
  return (
    (file.size === 0 && file.type === "") || // Check for empty folder-like files
    fileWithPath.webkitRelativePath?.length > 0 // Check if file has a relative path indicating a folder
  );
}

// Formats file size from bytes to a readable string
export function formatFileSize(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals; // Decimal precision
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]; // File size units
  const i = Math.floor(Math.log(bytes) / Math.log(k)); // Determine the index of the size unit

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Copies text to the clipboard and handles potential browser restrictions
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text); // Modern approach with Clipboard API
      return true;
    } catch (error: unknown) {
      console.error("Failed to copy:", error);
      return false;
    }
  } else {
    // Fallback for older browsers (Safari, etc.)
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "absolute";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      return successful;
    } catch (error: unknown) {
      console.error("Fallback: Oops, unable to copy", error);
      return false;
    } finally {
      document.body.removeChild(textArea); // Cleanup after copy attempt
    }
  }
}

// Reads a file as an ArrayBuffer in chunks
export async function readFileAsArrayBuffer(
  file: File,
  offset: number = 0,
  chunkSize: number = file.size,
): Promise<{ chunkData: ArrayBuffer; chunkDataSize: number }> {
  if (offset >= file.size) {
    return {
      chunkData: new ArrayBuffer(0),
      chunkDataSize: 0,
    };
  }

  try {
    const slice = file.slice(offset, offset + chunkSize); // Slice the file into chunks
    const chunkData = await slice.arrayBuffer(); // Convert chunk to ArrayBuffer

    const chunkDataSize = chunkData.byteLength;

    return { chunkData, chunkDataSize };
  } catch (error: unknown) {
    console.error("Error reading file:", error);
    throw new Error("Failed to read file chunk");
  }
}

// Prepares a dummy file for download, showing progress if necessary
export async function handlePrepareDummyFile(
  setIsFileLoading: (isFileLoading: boolean) => void,
  setFile: (file: File) => void,
  setProgress?: (progress: number) => void,
) {
  setIsFileLoading(true);

  const url = "/api/download/dummy-file"; // URL for the dummy file
  const fileName = url.split("/").pop() || "download-file"; // Extract file name from URL

  const controller = new AbortController();
  const response = await axios.get(url, {
    responseType: "blob", // Get file as Blob
    signal: controller.signal,
    onDownloadProgress: (progress: AxiosProgressEvent) => {
      const { loaded, total } = progress;
      if (total && setProgress) {
        const percent = Math.round((loaded / total) * 100); // Calculate download progress percentage
        setProgress(percent); // Update progress
      }
    },
  });

  const blobData = await response.data; // Get the Blob data

  const file = new File([blobData], fileName, {
    type: blobData.type, // Assign the correct file type
  });

  setFile(file); // Set the file in the state
  setIsFileLoading(false); // Set loading state to false after file is ready
}
