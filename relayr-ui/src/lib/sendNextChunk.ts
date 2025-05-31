import { FileSenderState } from "@/stores/useFileSenderStore";
import { FileChunkRequest, FileEndRequest } from "@/types/webSocketMessages";
import { readFileAsArrayBuffer } from "./utils";
import { CHUNK_SIZE } from "./constants";

interface SendNextChunkProps {
  get: () => FileSenderState;
  set: (partial: Partial<FileSenderState>) => void;
}

export async function sendNextChunk({ get, set }: SendNextChunkProps) {
  const {
    file,
    transferConnection,
    fileTransferInfo,
    transferStatus,
    webSocketHandlers,
  } = get();
  const { sendJsonMessage, sendMessage } = webSocketHandlers;

  const { totalChunks } = fileTransferInfo;
  const { chunkIndex, offset, isTransferCanceled } = transferStatus;

  if (
    !file ||
    !transferConnection.recipientId ||
    !sendJsonMessage ||
    !sendMessage
  ) {
    set({ errorMessage: "No file or recipient found" });
    return;
  }

  if (isTransferCanceled) {
    set({ errorMessage: "You canceled the transfer" });
    console.warn("Transfer has been canceled. No more chunks will be sent.");
    return;
  }

  if (chunkIndex >= totalChunks) {
    //console.log("All data sent. Sending fileEnd signal.");
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

    const uploadedSize = transferStatus.offset + chunkDataSize;
    const senderTransferProgress = Math.min(
      100,
      Math.floor((uploadedSize / file.size) * 100),
    );

    sendJsonMessage({
      type: "fileChunk",
      fileName: file.name,
      totalSize: file.size,
      totalChunks: fileTransferInfo.totalChunks,
      chunkIndex: transferStatus.chunkIndex,
      chunkDataSize,
      uploadedSize,
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

    //console.log(
    //  `Chunk ${chunkIndex}/${totalChunks} sent. Progress: ${transferProgress}%`,
    //);
  } catch (error: unknown) {
    const errorMsg = "Failed to send next chunk";
    set({ errorMessage: errorMsg });
    console.error(errorMsg + error);
  }
}
