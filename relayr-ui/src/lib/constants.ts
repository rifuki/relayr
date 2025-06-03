// Constants for Chunk Size
export const CHUNK_SIZE = 128 * 1024; // 128 KB

// Environment-specific configurations
const isDev = process.env.NODE_ENV === "development"; // Check if the environment is development

// Protocols for HTTP and WebSocket based on the environment
const httpProtocol = isDev ? "http" : "https";
const wsProtocol = isDev ? "ws" : "wss";

// Base URL for the API and WebSocket connection
const BASE_API_URL = `${process.env.NEXT_PUBLIC_API_SOCKET_ADDRESS}/api/v1`;

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
