// Importing necessary types and dependencies
import { FileMetadata } from "@/types/file";
import apiClient from "../axios-instance";
import { API_ENDPOINTS } from "../endpoints";

// Relay Service for file-related API calls
export const relayService = {
  /**
   * Fetches file metadata for a given senderId.
   * @param {string} senderId - The ID of the sender whose file metadata is to be fetched.
   * @returns {Promise<FileMetadata>} - A promise that resolves to the file metadata.
   */
  getFileMetadata: async (senderId: string): Promise<FileMetadata> => {
    const response = await apiClient.get(
      API_ENDPOINTS.RELAY.FILE_METADATA(senderId), // Construct API endpoint using senderId
    );
    return response.data; // Return the file metadata from the response
  },
};
