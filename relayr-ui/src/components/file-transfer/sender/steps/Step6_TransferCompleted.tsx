// External Libraries
import { FileCheckIcon, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

// ShadCN UI Components
import { Badge } from "@/components/ui/badge";

// Motion-Primitives UI Components
import { MotionButton } from "@/components/animations/motion-button";

// Internal Components
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
} from "@/stores/useFileSenderStore";
import ShareableLinkInput from "@/components/ShareableLinkInput";

// Motion Animation
const burstAnimation = {
  scale: [1, 2, 0],
  opacity: [1, 0.8, 0],
  transition: {
    duration: 1.5,
    ease: "easeOut",
  },
};
const successAnimation = {
  scale: [0, 1.5, 1],
  opacity: [0, 1],
  rotate: [0, 0],
  transition: {
    duration: 1.5,
    ease: "easeOut",
  },
};

/**
 * Step6_TransferCompleted component represents the final step in the file sending process.
 * It displays a success message, recipient ID, file metadata, and a shareable link.
 * The sender can reset the transfer to send another file.
 *
 * @returns JSX.Element The rendered component.
 */
export default function Step6_TransferCompleted() {
  const { recipientId, transferShareLink } = useFileSenderStore(
    (state) => state.lastTransferInfo,
  );
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const actions = useFileSenderActions();

  if (!fileMetadata || !recipientId || !transferShareLink) return null;

  const handleResetTransfer = () => {
    actions.setFile(null);
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
        title="Transfer Completed"
        description="Your file has been successfully transferred"
      />

      <motion.div
        className="relative flex justify-center items-center my-10 mb-15"
        variants={fileListItemVariants}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-green-500"
          initial={{ scale: 0, opacity: 0 }}
          animate={burstAnimation}
        />
        <motion.div
          className="relative z-1"
          initial={{ scale: 0, opacity: 0 }}
          animate={successAnimation}
        >
          <div className="bg-green-500 rounded-full p-4">
            <FileCheckIcon className="h-10 w-10 text-white" />
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="w-full flex flex-col items-center space-y-5"
        variants={fileListItemVariants}
      >
        <Badge className="p-2 bg-primary/90">Recipient ID: {recipientId}</Badge>
        <ShareableLinkInput
          text={transferShareLink}
          disabled={true}
          className="mt-2"
        />
        <TransferFileCard fileMetadata={fileMetadata} />

        <SenderTransferProgress />
      </motion.div>

      <motion.div
        className="w-full flex flex-col space-y-3 mt-2"
        variants={fileListItemVariants}
      >
        <MotionButton onClick={handleResetTransfer}>
          <RefreshCw className="h-4 w-4" />
          Send Another File
        </MotionButton>
      </motion.div>
    </motion.div>
  );
}
