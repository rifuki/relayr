import { CloudUploadIcon } from "lucide-react";
import { motion } from "motion/react";

import FileCard from "@/components/FileCard";
import { MotionButton } from "@/components/motion-primitives/motion-button";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import SenderProgressBar from "@/components/SenderProgressBar";
import ShareableLinkInput from "@/components/ShareableLinkInput";
import TransferHeader from "@/components/TransferHeader";
import { Badge } from "@/components/ui/badge";
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";
import {
  useFileSenderActions,
  useFileSenderStore,
  useWebSocketHandlers,
} from "@/stores/useFileSenderStore";
import { CancelSenderTransferRequest } from "@/types/webSocketMessages";

export default function TransferInProgress() {
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const { recipientId } = useFileSenderStore(
    (state) => state.transferConnection,
  );

  const { sendJsonMessage } = useWebSocketHandlers();
  const actions = useFileSenderActions();

  if (!fileMetadata || !recipientId || !transferShareLink || !sendJsonMessage)
    return;

  const handleCancelSenderTransfer = () => {
    actions.setTransferStatus({ isTransferCanceled: true });
    sendJsonMessage({
      type: "cancelSenderTransfer",
    } satisfies CancelSenderTransferRequest);
    actions.clearTransferState();
  };

  return (
    <motion.div
      className="flex flex-col items-center space-y-5"
      variants={fileListWrapperVariants}
      initial="hidden"
      animate="show"
    >
      <TransferHeader
        title="Transferring File"
        description="Please keep this tab open while the transfer in progress."
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
        <CloudUploadIcon className="h-15 w-15 my-10" />
      </motion.div>

      <motion.div
        className="w-full flex flex-col items-center space-y-5"
        variants={fileListItemVariants}
      >
        <Badge className="p-2 bg-primary/90">Recipient ID: {recipientId}</Badge>
        <ShareableLinkInput text={transferShareLink} className="mt-2" />
        <FileCard fileMetadata={fileMetadata} />
      </motion.div>

      <SenderProgressBar />

      <motion.div
        variants={fileListItemVariants}
        className="w-full flex flex-col space-y-3 mt-2"
      >
        <TextShimmer className="text-center" duration={1}>
          ⚠️ Transfer in progress — stay on this page.
        </TextShimmer>

        <MotionButton
          onClick={handleCancelSenderTransfer}
          variant="destructive"
        >
          Abort Transfer
        </MotionButton>
      </motion.div>
    </motion.div>
  );
}
