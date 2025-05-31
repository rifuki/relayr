import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";
import {
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";
import { useEffect } from "react";
import { nanoid } from "nanoid";

function generateAndStoreId(user: "sender" | "receiver"): string {
  const storedId = localStorage.getItem(user);
  if (!storedId) {
    const newId = nanoid(7);
    localStorage.setItem(user, newId);
    return newId;
  }
  return storedId;
}

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
