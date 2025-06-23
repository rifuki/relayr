// Internal Function
import { getApiUrl } from "./get-api-url";

// API path for the application
const API_PATH = "/api/v1";

// Get the API URL from the environment or runtime configuration
const apiUrl = getApiUrl();

// Parse the API URL to extract protocol and host
const urlObject = new URL(apiUrl);
// Protocols for HTTP and WebSocket based on the environment
const httpProtocol = urlObject.protocol.replace(":", "");
const wsProtocol = httpProtocol === "https" ? "wss" : "ws";
// Host (without protocol) for the API and WebSocket connection
// Base API URL for the API and WebSocket connection
const BASE_API_URL = `${urlObject.host}${API_PATH}`;
// Construct HTTP and WebSocket API URLs
export const http_api_url = `${httpProtocol}://${BASE_API_URL}`;
export const ws_relay_api_url = `${wsProtocol}://${BASE_API_URL}/relay`;
