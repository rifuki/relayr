// External Libraries
import { CloudUploadIcon } from "lucide-react";
import { motion } from "motion/react";

// ShadCN UI Components
import { Badge } from "@/components/ui/badge";

// Motion-Primitives UI Components
import { MotionButton } from "@/components/motion-primitives/motion-button";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

// Internal Components
import ShareableLinkInput from "@/components/ShareableLinkInput";
import { SenderTransferProgress } from "../components";
import { TransferFileCard, TransferHeader } from "../../shared";

// Animation Variants
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";

// State Management (Store)
import {
  useFileSenderActions,
  useFileSenderStore,
  useSenderWebSocketHandlers,
} from "@/stores/useFileSenderStore";

// Types
import { CancelSenderTransferRequest } from "@/types/webSocketMessages";

/**
 * Step5_Sending component represents the fifth step in the file sending process.
 * It displays a header, a cloud upload icon, recipient ID, shareable link input,
 * and file metadata. It also shows the transfer progress and allows the sender to
 * cancel the transfer.
 *
 * @returns JSX.Element The rendered component.
 */
export default function Step5_Sending() {
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const { recipientId } = useFileSenderStore(
    (state) => state.transferConnection,
  );

  const { sendJsonMessage } = useSenderWebSocketHandlers();
  const actions = useFileSenderActions();

  if (!fileMetadata || !recipientId || !transferShareLink || !sendJsonMessage)
    return;

  const handleCancelSenderTransfer = () => {
    sendJsonMessage({
      type: "cancelSenderTransfer",
    } satisfies CancelSenderTransferRequest);
    actions.setTransferStatus({ isTransferCanceled: true });
    actions.setErrorMessage("You canceled the transfer");
    console.warn("Transfer has been canceled. No more chunks will be sent.");
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
        <TransferFileCard fileMetadata={fileMetadata} />
      </motion.div>

      <SenderTransferProgress />

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
