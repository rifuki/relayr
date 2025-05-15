import { FileMetadata } from "@/types/file";
import apiClient from "../axios-instance";
import { API_ENDPOINTS } from "../endpoints";

export const relayService = {
  getFileMetadata: async (senderId: string): Promise<FileMetadata> => {
    const response = await apiClient.get(
      API_ENDPOINTS.RELAY.FILE_METADATA(senderId),
    );
    return response.data;
  },
};
