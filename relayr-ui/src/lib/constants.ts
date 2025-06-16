// Constants for Chunk Size
export const CHUNK_SIZE = 32 * 1024; // 32 KB chunk size for file transfers

// Environment-specific configurations
const isDev = process.env.NODE_ENV === "development"; // Check if the environment is development

// Protocols for HTTP and WebSocket based on the environment
const httpProtocol = isDev ? "http" : "https";
const wsProtocol = isDev ? "ws" : "wss";

// Host (without protocol) for the API and WebSocket connection
const API_HOST = process.env.NEXT_PUBLIC_API_SOCKET_ADDRESS || "localhost:9001";

// API path for the application
const API_PATH = "/api/v1";

// Base URL for the API and WebSocket connection
const BASE_API_URL = `${API_HOST}${API_PATH}`;

// Construct HTTP and WebSocket API URLs
const HTTP_API_URL = `${httpProtocol}://${BASE_API_URL}`;
const WS_RELAY_API_URL = `${wsProtocol}://${BASE_API_URL}/relay`;

// Export constants for use in other parts of the application
export {
  isDev,
  httpProtocol,
  wsProtocol,
  BASE_API_URL,
  HTTP_API_URL,
  WS_RELAY_API_URL,
};
