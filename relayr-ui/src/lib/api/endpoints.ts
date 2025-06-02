// API Endpoints Configuration
export const API_ENDPOINTS = {
  RELAY: {
    // Endpoint to get file metadata using senderId
    FILE_METADATA: (senderId: string) => `/relay/file-meta/${senderId}`,
  },
};
