import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { ReadyState } from "react-use-websocket";
import axios, { AxiosProgressEvent } from "axios";

export function isFolderLike(file: File): boolean {
  const fileWithPath = file as File & { webkitRelativePath?: string };
  return (
    (file.size === 0 && file.type === "") ||
    fileWithPath.webkitRelativePath?.length > 0
  );
}

export function getConnectionStatus(readyState: ReadyState): string {
  return {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error: unknown) {
      console.error("Failed to copy:", error);
      return false;
    }
  } else {
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
      document.body.removeChild(textArea);
    }
  }
}

export async function readFileAsArrayBuffer(
  file: File,
  offset: number = 0,
  chunkSize: number = file.size,
): Promise<{ chunkData: Uint8Array; chunkDataSize: number }> {
  try {
    const slice = file.slice(offset, offset + chunkSize);
    const result = await slice.arrayBuffer();

    const chunkData = new Uint8Array(result);
    const chunkDataSize = chunkData.byteLength;

    return { chunkData, chunkDataSize };
  } catch (error: unknown) {
    console.log("Error reading file:", error);
    throw new Error("Failed to read file chunk");
  }
}

export async function handlePrepareDummyFile(
  setIsFileLoading: (isFileLoading: boolean) => void,
  setFile: (file: File) => void,
  setDummyDownloadProgress?: (dummyDownloadProgress: number) => void,
) {
  setIsFileLoading(true);

  const url = "/api/download/dummy-file";
  const fileName = url.split("/").pop() || "download-file";

  const controller = new AbortController();
  const response = await axios.get(url, {
    responseType: "blob",
    signal: controller.signal,
    onDownloadProgress: (progress: AxiosProgressEvent) => {
      const { loaded, total } = progress;
      if (total && setDummyDownloadProgress) {
        const percent = Math.round((loaded / total) * 100);
        setDummyDownloadProgress(percent);
      }
    },
  });

  const blobData = await response.data;

  const file = new File([blobData], fileName, {
    type: blobData.type,
  });

  setFile(file);
  setIsFileLoading(false);
}
