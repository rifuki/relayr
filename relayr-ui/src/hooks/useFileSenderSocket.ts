import { useEffect } from "react";
import {
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";

export function useFileSenderSocket() {
  const actions = useFileSenderActions();
  const webSocketUrl = useFileSenderStore((state) => state.webSocketUrl);

  useEffect(() => {
    if (webSocketUrl) {
      actions.connectWebSocket(webSocketUrl);
    }
    // Optional: disconnect saat unmount
    // return () => actions.disconnectWebSocket();
  }, [webSocketUrl, actions]);
}
