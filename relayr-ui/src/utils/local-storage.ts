const SENDER_KEYS = ["sender"];
export function resetSenderLocalStorage() {
  SENDER_KEYS.forEach((key) => localStorage.removeItem(key));
}

const RECEIVER_KEYS = ["receiver"];
export function resetReceiverLocalStorage() {
  RECEIVER_KEYS.forEach((key) => localStorage.removeItem(key));
}
