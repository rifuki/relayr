export const CHUNK_SIZE = 128 * 1024;

const isDev = process.env.NODE_ENV === "development";
const httpProtocol = isDev ? "http" : "https";
const wsProtocol = isDev ? "ws" : "wss";

const BASE_API_URL = `${process.env.NEXT_PUBLIC_API_SOCKET_ADDRESS}/api/v1`;
const HTTP_API_URL = `${httpProtocol}://${BASE_API_URL}`;
const WS_RELAY_API_URL = `${wsProtocol}://${BASE_API_URL}/relay`;

export {
  isDev,
  httpProtocol,
  wsProtocol,
  BASE_API_URL,
  HTTP_API_URL,
  WS_RELAY_API_URL,
};
