// Importing necessary types and dependencies
import { FileMetadata } from "@/types/file";
import apiClient from "../axios-instance";
import { API_ENDPOINTS } from "../endpoints";

// Relay Service for file-related API calls
export const relayService = {
  // Function to get file metadata from the server
  getFileMetadata: async (senderId: string): Promise<FileMetadata> => {
    const response = await apiClient.get(
      API_ENDPOINTS.RELAY.FILE_METADATA(senderId), // Construct API endpoint using senderId
    );
    return response.data; // Return the file metadata from the response
  },
};
