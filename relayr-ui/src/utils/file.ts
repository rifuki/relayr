// Checks if the file is folder-like (either zero size with no type or has a relative path)
export function isFolderLike(file: File): boolean {
  const fileWithPath = file as File & { webkitRelativePath?: string };
  return (
    (file.size === 0 && file.type === "") || // Check for empty folder-like files
    fileWithPath.webkitRelativePath?.length > 0 // Check if file has a relative path indicating a folder
  );
}

// Formats a file size in bytes into a human-readable string with appropriate units
export function formatFileSize(
  bytes: number,
  decimals = 2,
): { value: number; unit: string; formatted: string } {
  if (bytes === 0) return { value: 0, unit: "Bytes", formatted: "0 Bytes" };

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals; // Decimal precision
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]; // File size units
  const i = Math.floor(Math.log(bytes) / Math.log(k)); // Determine the index of the size unit

  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm)); // Calculate the size in the appropriate unit
  const unit = sizes[i]; // Get the corresponding size unit

  return {
    value,
    unit,
    formatted: `${value} ${unit}`, // Return formatted size string
  };
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
