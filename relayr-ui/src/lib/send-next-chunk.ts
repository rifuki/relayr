// State Management (Store)
import { FileSenderState } from "@/stores/useFileSenderStore";

// Types
import { FileChunkRequest, FileEndRequest } from "@/types/webSocketMessages";

// Constants
import { CHUNK_SIZE } from "./constants";

// Utilities
import { readFileAsArrayBuffer } from "@/utils/file";
import { WebSocketHook } from "react-use-websocket/dist/lib/types";

// Props for the sendNextChunk function
interface SendNextChunkProps {
  get: () => FileSenderState;
  set: (partial: Partial<FileSenderState>) => void;
}
// Handlers interface for WebSocket operations
export interface SendNextChunkHandlers {
  sendJsonMessage: WebSocketHook["sendJsonMessage"];
  sendMessage: WebSocketHook["sendMessage"];
}

/**
 * Sends the next chunk of a file over WebSocket.
 *
 * @param {SendNextChunkProps} props - Contains get and set functions for state management.
 * @param {SendNextChunkHandlers} handlers - Contains WebSocket message sending functions.
 *
 * @return Promise<void> - A promise that resolves when the chunk is sent or an error occurs.
 * @throws {Error} - Throws an error if the file cannot be read or sent.
 *
 * @description
 * This function:
 * - Reads the next chunk of a file.
 * - Sends the chunk over WebSocket to the recipient.
 * - Updates the transfer progress and status.
 * - Handles chunk indexing to ensure proper ordering.
 * - Tracks transfer progress and allows cancellation.
 * - Sends a final message once the transfer is complete.
 */
export async function sendNextChunk(
  { get, set }: SendNextChunkProps,
  handlers: SendNextChunkHandlers,
) {
  // Destructuring state variables from the store
  const { file, fileTransferInfo, transferStatus } = get();
  const { sendJsonMessage, sendMessage } = handlers;

  const { totalChunks } = fileTransferInfo;
  const { chunkIndex, offset } = transferStatus;

  // If no file or WebSocket handlers exist, return early
  if (!file || !sendJsonMessage || !sendMessage) return;

  // If all chunks are sent, send the "fileEnd" message and stop the transfer
  if (chunkIndex >= totalChunks) {
    sendJsonMessage({
      type: "fileEnd",
      fileName: file.name,
      totalSize: file.size,
      totalChunks,
      uploadedSize: offset,
      lastChunkIndex: chunkIndex,
    } satisfies FileEndRequest); // Sends the end of file transfer message

    // Update transfer status to indicate no ongoing transfer
    set({
      transferStatus: {
        ...transferStatus,
        isTransferring: false,
      },
    });
    return;
  }

  try {
    // Read the next chunk of the file
    const { chunkData, chunkDataSize } = await readFileAsArrayBuffer(
      file,
      transferStatus.offset,
      CHUNK_SIZE,
    );

    // If no data was read (file may be fully processed or error), stop the process
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

    // If transfer was canceled, stop sending the chunk
    if (get().transferStatus.isTransferCanceled) {
      console.warn("Transfer canceled after reading chunk, aborting send.");
      return;
    }
    // If there was an error in the transfer, stop sending the chunk
    if (get().transferStatus.isTransferError) {
      console.warn("Transfer error occurred, aborting send.");
      return;
    }

    const uploadedSize = transferStatus.offset + chunkDataSize; // Update the uploaded size based on the chunk
    const senderTransferProgress = Math.min(
      100,
      Math.floor((uploadedSize / file.size) * 100), // Calculate sender progress (percentage)
    );

    // Send the chunk data over WebSocket
    sendJsonMessage({
      type: "fileChunk",
      fileName: file.name,
      totalSize: file.size,
      totalChunks: fileTransferInfo.totalChunks,
      uploadedSize,
      chunkIndex,
      chunkDataSize,
      senderTransferProgress,
    } satisfies FileChunkRequest); // Sends the chunk metadata
    sendMessage(chunkData); // Sends the actual chunk data

    // Update the store with the latest transfer status and progress
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
    // Handle any errors that occur during the transfer
    const errorMsg = "Failed to send next chunk";
    set({ errorMessage: errorMsg });
    console.error(errorMsg + error);
  }
}
