import { FileSenderState } from "@/stores/useFileSenderStore";
import { FileChunkRequest, FileEndRequest } from "@/types/webSocketMessages";
import { CHUNK_SIZE } from "./constants";
import { readFileAsArrayBuffer } from "./utils";

interface SendNextChunkProps {
  get: () => FileSenderState;
  set: (partial: Partial<FileSenderState>) => void;
}

export async function sendNextChunk({ get, set }: SendNextChunkProps) {
  const { file, fileTransferInfo, transferStatus, webSocketHandlers } = get();
  const { sendJsonMessage, sendMessage } = webSocketHandlers;

  const { totalChunks } = fileTransferInfo;
  const { chunkIndex, offset } = transferStatus;

  if (!file || !sendJsonMessage || !sendMessage) return;

  if (chunkIndex >= totalChunks) {
    sendJsonMessage({
      type: "fileEnd",
      fileName: file.name,
      totalSize: file.size,
      totalChunks,
      lastChunkIndex: chunkIndex,
      uploadedSize: offset,
    } satisfies FileEndRequest);

    set({
      transferStatus: {
        ...transferStatus,
        isTransferring: false,
      },
    });
    return;
  }

  try {
    const { chunkData, chunkDataSize } = await readFileAsArrayBuffer(
      file,
      transferStatus.offset,
      CHUNK_SIZE,
    );

    // Stop if no data was read (e.g. offset beyond file size)
    if (chunkDataSize === 0) {
      console.warn("No chunk data read. Skipping send.");
      set({
        transferStatus: {
          ...transferStatus,
          isTransferring: false,
        },
      });
      return;
    }

    if (get().transferStatus.isTransferCanceled) {
      console.warn("Transfer canceled after reading chunk, aborting send.");
      return;
    }

    const uploadedSize = transferStatus.offset + chunkDataSize;
    const senderTransferProgress = Math.min(
      100,
      Math.floor((uploadedSize / file.size) * 100),
    );

    const { isTransferCanceled } = get().transferStatus; // Dapatkan nilai terbaru
    if (isTransferCanceled) {
      console.warn("Transfer canceled after chunk send.");
      return;
    }

    sendJsonMessage({
      type: "fileChunk",
      fileName: file.name,
      totalSize: file.size,
      totalChunks: fileTransferInfo.totalChunks,
      uploadedSize,
      chunkIndex,
      chunkDataSize,
      senderTransferProgress,
    } satisfies FileChunkRequest);
    sendMessage(chunkData);

    set({
      transferStatus: {
        ...transferStatus,
        uploadedSize,
        chunkDataSize,
        isTransferring: true,
      },
      transferProgress: {
        ...get().transferProgress,
        sender: senderTransferProgress,
      },
    });
  } catch (error: unknown) {
    const errorMsg = "Failed to send next chunk";
    set({ errorMessage: errorMsg });
    console.error(errorMsg + error);
  }
}
