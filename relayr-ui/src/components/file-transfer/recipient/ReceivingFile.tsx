import { CloudDownload } from "lucide-react";
import { motion } from "motion/react";

import FileCard from "@/components/FileCard";
import { MotionButton } from "@/components/motion-primitives/motion-button";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import ReceiverProgressBar from "@/components/ReceiverProgressBar";
import TransferHeader from "@/components/TransferHeader";
import { Badge } from "@/components/ui/badge";
import {
  fileListWrapperVariants,
  fileListItemVariants,
} from "@/lib/animations";
import {
  useFileReceiverActions,
  useFileReceiverStore,
  useReceiverWebSocketHandlers,
} from "@/stores/useFileReceiverStore";
import { CancelRecipientTransferPayload } from "@/types/webSocketMessages";

export default function ReceivingFile() {
  const { senderId } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);
  const { sendJsonMessage } = useReceiverWebSocketHandlers();
  const actions = useFileReceiverActions();

  if (!senderId || !fileMetadata || !sendJsonMessage) return;

  const handleCancelRecipientTransfer = () => {
    sendJsonMessage({
      type: "cancelRecipientTransfer",
      senderId,
    } satisfies CancelRecipientTransferPayload);
    actions.setTransferStatus({ isTransferCanceled: true });
    actions.setErrorMessage("You canceled the transfer");
  };

  return (
    <motion.div
      className="flex flex-col items-center space-y-5"
      variants={fileListWrapperVariants}
      initial="hidden"
      animate="show"
    >
      <TransferHeader
        title="Receiving File"
        description="The file is being transferred. Please wait a moment"
      />

      <motion.div
        variants={fileListItemVariants}
        animate={{ scale: [1, 1, 1, 1], rotate: [0, 5, -5, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          repeatDelay: 1,
        }}
      >
        <CloudDownload className="h-15 w-15 my-10" />
      </motion.div>

      <motion.div
        className="w-full flex flex-col items-center space-y-5"
        variants={fileListItemVariants}
      >
        <Badge className="p-2 bg-primary/90">Sender ID: {senderId}</Badge>
        <FileCard fileMetadata={fileMetadata} className="mt-2" />
      </motion.div>

      <ReceiverProgressBar />

      <motion.div className="w-full flex flex-col space-y-3 mt-2">
        <TextShimmer className="text-center" duration={1}>
          ⚠️ Transfer in progress — stay on this page.
        </TextShimmer>

        <MotionButton
          onClick={handleCancelRecipientTransfer}
          variant="destructive"
        >
          Abort Transfer
        </MotionButton>
      </motion.div>
    </motion.div>
  );
}
