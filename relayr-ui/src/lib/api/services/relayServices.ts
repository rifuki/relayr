import { apiClient, API_ENDPOINTS } from "../";

// Types
import { FileMetadata } from "@/types/file";

// Relay Service for file-related API calls
export const relayService = {
  /**
   * Fetches file metadata for a given senderId.
   * @param {string} senderId - The ID of the sender to fetch file metadata for.
   * @returns {Promise<FileMetadata>} - A promise that resolves to the file metadata.
   */
  getFileMetadata: async (senderId: string): Promise<FileMetadata> => {
    const response = await apiClient.get(
      API_ENDPOINTS.RELAY.FILE_METADATA(senderId), // Construct API endpoint using senderId
    );
    return response.data; // Return the file metadata from the response
  },
  /**
   * Pings the relay server to check its status.
   * @returns {Promise<{ data: string; ms: number }>} - A promise that resolves to an object containing the response data and the time taken for the request in milliseconds.
   */
  ping: async (): Promise<{ data: string; ms: number }> => {
    const start = performance.now(); // Start performance measurement
    const response = await apiClient.get(API_ENDPOINTS.RELAY.PING);
    const data = await response.data;
    const ms = Math.round(performance.now() - start);
    return { data, ms };
  },
};
