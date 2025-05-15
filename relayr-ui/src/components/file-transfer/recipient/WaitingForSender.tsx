import { ClockIcon } from "lucide-react";
import { motion } from "motion/react";
import FileCard from "@/components/FileCard";
import { MotionButton } from "@/components/motion-primitives/motion-button";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import ReceiverProgressBar from "@/components/ReceiverProgressBar";
import TransferHeader from "@/components/TransferHeader";
import { Badge } from "@/components/ui/badge";
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";
import { CancelRecipientReadyPayload } from "@/types/webSocketMessages";

const clockAnimation = {
  rotate: [0, 360],
  transition: {
    repeat: Infinity,
    duration: 7.5,
    ease: "linear",
  },
};

export default function WaitingForSender() {
  const senderId = useFileReceiverStore((state) => state.senderId);
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);
  const isConnectedToSender = useFileReceiverStore(
    (state) => state.isConnectedToSender,
  );
  const isSenderTransferring = useFileReceiverStore(
    (state) => state.isSenderTransferring,
  );

  const { sendJsonMessage, getWebSocket } = useFileReceiverStore(
    (state) => state.wsHandlers,
  );
  const actions = useFileReceiverActions();

  if (!senderId || !fileMetadata || !sendJsonMessage) return;

  const handleCancelRecipientReady = () => {
    sendJsonMessage({
      type: "cancelRecipientReady",
      senderId,
    } satisfies CancelRecipientReadyPayload);

    const ws = getWebSocket?.();
    if (!ws) {
      actions.setErrorMessage("WebSocket is not available.");
      return;
    }
    ws.close(1000, "Recipient canceled before transfer started");

    actions.setIsConnectedToSender(false);
    actions.setRecipientId(null);
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

        <FileCard fileMetadata={fileMetadata} className="mt-2" />
      </motion.div>

      <ReceiverProgressBar />

      {isConnectedToSender && !isSenderTransferring && (
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
      )}
    </motion.div>
  );
}
