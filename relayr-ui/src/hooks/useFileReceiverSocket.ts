import { useEffect } from "react";
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

export function useFileReceiverSocket() {
  const actions = useFileReceiverActions();
  const webSocketUrl = useFileReceiverStore((state) => state.webSocketUrl);

  useEffect(() => {
    if (webSocketUrl) {
      actions.connectWebSocket(webSocketUrl);
    }
    // Optional: disconnect saat unmount
    // return () => actions.disconnectWebSocket();
  }, [webSocketUrl, actions]);
}
