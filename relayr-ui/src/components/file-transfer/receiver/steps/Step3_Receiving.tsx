// External Libraries
import { CloudDownload } from "lucide-react";
import { motion } from "motion/react";

// ShadCN UI Components
import { Badge } from "@/components/ui/badge";

// Motion-Primitives UI Components
import { MotionButton } from "@/components/animations/motion-button";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

// Internal Components
import { TransferProgress } from "../components";
import { TransferFileCard, TransferHeader } from "../../shared";

// Animation Variants
import {
  fileListWrapperVariants,
  fileListItemVariants,
} from "@/lib/animations";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
  useReceiverWebSocketHandlers,
} from "@/stores/useFileReceiverStore";

// Types
import { CancelRecipientTransferRequest } from "@/types/webSocketMessages";

/**
 * Step3_Receiving component represents the third step in the file receiving process.
 * It displays the current status of the file transfer, including the sender ID,
 * the file metadata, and a button to cancel the transfer.
 * It uses motion for animations and ShadCN UI components for styling.
 *
 * @returns JSX.Element The rendered component.
 */
export default function Step3_Receiving() {
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);
  const { senderId } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
  const { sendJsonMessage } = useReceiverWebSocketHandlers();
  const actions = useFileReceiverActions();

  if (!senderId || !fileMetadata || !sendJsonMessage) return;

  const handleCancelRecipientTransfer = () => {
    sendJsonMessage({
      type: "cancelRecipientTransfer",
      senderId,
    } satisfies CancelRecipientTransferRequest);
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
        <TransferFileCard fileMetadata={fileMetadata} className="mt-2" />
      </motion.div>

      <TransferProgress />

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
