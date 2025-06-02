import { ClockIcon } from "lucide-react";
import { motion } from "motion/react";

import { MotionButton } from "@/components/motion-primitives/motion-button";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { Badge } from "@/components/ui/badge";
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";
import { CancelRecipientReadyRequest } from "@/types/webSocketMessages";
import {
  ReceiverTransferProgress,
  TransferFileCard,
  TransferHeader,
} from "../../shared";

const clockAnimation = {
  rotate: [0, 360],
  transition: {
    repeat: Infinity,
    duration: 7.5,
    ease: "linear",
  },
};

export default function Step2_WaitingForSender() {
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);
  const { senderId } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
  const { sendJsonMessage, getWebSocket } = useFileReceiverStore(
    (state) => state.webSocketHandlers,
  );
  const actions = useFileReceiverActions();

  if (!senderId || !fileMetadata || !sendJsonMessage) return;

  const handleCancelRecipientReady = () => {
    sendJsonMessage({
      type: "cancelRecipientReady",
      senderId,
    } satisfies CancelRecipientReadyRequest);

    const ws = getWebSocket?.();
    if (!ws) {
      actions.setErrorMessage("WebSocket is not available.");
      return;
    }
    ws.close(1000, "Recipient canceled before transfer started");

    actions.setTransferConnection({ recipientId: null, isConnected: false });
    actions.setErrorMessage(null);
  };

  return (
    <motion.div
      className="flex flex-col items-center space-y-5"
      variants={fileListWrapperVariants}
      initial="hidden"
      animate="show"
    >
      <TransferHeader
        title="Getting Ready"
        description="Waiting for the sender to start the upload"
      />

      <motion.div
        className="flex flex-col items-center"
        variants={fileListItemVariants}
        animate={clockAnimation}
      >
        <ClockIcon className="h-15 w-15 my-10" />
      </motion.div>

      <motion.div
        className="w-full flex flex-col items-center space-y-5"
        variants={fileListItemVariants}
      >
        <Badge className="p-2 bg-primary/90">Sender ID: {senderId}</Badge>

        <TransferFileCard fileMetadata={fileMetadata} className="mt-2" />
      </motion.div>

      <ReceiverTransferProgress />

      <motion.div className="w-full flex flex-col space-y-3 mt-2">
        <TextShimmer className="text-center" duration={1}>
          ⚠️ Transfer in progress — stay on this page.
        </TextShimmer>
        <MotionButton
          onClick={handleCancelRecipientReady}
          variant="destructive"
        >
          Cancel
        </MotionButton>
      </motion.div>
    </motion.div>
  );
}
