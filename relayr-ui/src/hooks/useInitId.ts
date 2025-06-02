// React
import { useEffect } from "react";

// External Libraries
import { nanoid } from "nanoid";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";
import {
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";

/**
 * Generate a unique ID for sender/receiver, store it in localStorage, and return it.
 */
function generateAndStoreId(user: "sender" | "receiver"): string {
  const storedId = localStorage.getItem(user);
  if (!storedId) {
    const newId = nanoid(7);
    localStorage.setItem(user, newId);
    return newId;
  }
  return storedId;
}

/**
 * Custom hook to initialize the user's ID and store it in the respective state.
 */
export function useInitId(user: "sender" | "receiver"): string | null {
  const senderInitId = useFileSenderStore((state) => state.initId);
  const receiverInitId = useFileReceiverStore((state) => state.initId);

  const { setInitId: setSenderInitId } = useFileSenderActions();
  const { setInitId: setReceiverInitId } = useFileReceiverActions();

  useEffect(() => {
    const id = generateAndStoreId(user);
    if (user === "sender") {
      setSenderInitId(id);
    } else {
      setReceiverInitId(id);
    }
  }, [user, setSenderInitId, setReceiverInitId]);

  return user === "sender" ? senderInitId : receiverInitId;
}
