// Constants for Chunk Size
export const CHUNK_SIZE = 32 * 1024; // 32 KB chunk size for file transfers

// Environment-specific configurations
const isDev = process.env.NODE_ENV === "development";

// Get API_HOST from environment, fallback to localhost
const API_HOST = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:8080";
// Parse protocol from BASE_URL
const urlObject = new URL(API_HOST);

// Protocols for HTTP and WebSocket based on the environment
const httpProtocol = urlObject.protocol.replace(":", "");
const wsProtocol = httpProtocol === "https" ? "wss" : "ws";

// API path for the application
const API_PATH = "/api/v1";
// Host (without protocol) for the API and WebSocket connection
// Base API URL for the API and WebSocket connection
const BASE_API_URL = `${urlObject.host}${API_PATH}`;
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
