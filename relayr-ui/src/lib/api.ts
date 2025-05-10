const BASE_API_URL = `${process.env.NEXT_PUBLIC_API_SOCKET_ADDRESS}/api/v1`;

const RELAY_API_URL = `http://${BASE_API_URL}/relay`;
const WS_RELAY_API_URL = `ws://${BASE_API_URL}/relay`;

export { BASE_API_URL, RELAY_API_URL, WS_RELAY_API_URL };
