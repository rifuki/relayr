// React and Next.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// External Libraries
import { FileCheckIcon } from "lucide-react";
import { motion } from "motion/react";

// ShadCN UI Components
import { Badge } from "@/components/ui/badge";

// Motion-Primitives UI Components
import { MotionButton } from "@/components/animations/motion-button";

// Internal Components
import { ReceiverTransferProgress } from "../components";
import { TransferFileCard, TransferHeader } from "../../shared";

// Animation Variants
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

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
  transition: {
    duration: 1.5,
    ease: "easeOut",
  },
};

/**
 * Step4_TransferCompleted component represents the final step in the file receiving process.
 * It displays a success message, sender ID, file metadata, and a button to download the received file.
 * The component uses motion for animations and ShadCN UI components for styling.
 *
 * @returns JSX.Element The rendered component.
 */
export default function Step4_TransferCompleted() {
  const router = useRouter();

  // Read data from the receiver store
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);
  const { senderId } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
  const fileUrl = useFileReceiverStore((state) => state.fileUrl);
  const actions = useFileReceiverActions();

  // If essential data is missing, do not render this component
  if (!fileMetadata || !senderId || !fileUrl) return;

  // Save the last valid sender ID for future access (e.g., prefill)
  useEffect(() => {
    actions.setLastValidSenderId(senderId);
  }, [actions]);

  // Handler to trigger browser download for the received file
  const handleDownloadFile = () => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileMetadata.name || "downloaded-file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  // Handler to reset all relevant states and navigate to the receive page
  const handleStartNewTransfer = () => {
    actions.clearTransferState();
    actions.setTransferStatus({
      isTransferCanceled: false,
      isTransferCompleted: false,
    });
    actions.setFileMetadata(null);
    actions.setLastValidSenderId(null);
    actions.setIsReceiverFlowActive(false);
    router.push("/transfer/receive");
  };

  return (
    <motion.div
      className="flex flex-col items-center space-y-5"
      variants={fileListWrapperVariants}
      initial="hidden"
      animate="show"
    >
      {/* Section Header */}
      <TransferHeader
        title="Transfer Completed"
        description="The file has been successfully received"
      />

      {/* Animated Checkmark Icon */}
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

      {/* Sender ID and File Metadata */}
      <motion.div
        className="w-full flex flex-col items-center space-y-5"
        variants={fileListItemVariants}
      >
        <Badge className="p-2 bg-primary/90">Sender ID: {senderId}</Badge>
        <TransferFileCard fileMetadata={fileMetadata} />
      </motion.div>

      {/* Progress bar for visual indication */}
      <ReceiverTransferProgress />

      {/* Action buttons */}
      <motion.div
        className="w-full flex flex-col space-y-2"
        variants={fileListItemVariants}
      >
        <MotionButton onClick={handleDownloadFile}>Download</MotionButton>
        <MotionButton variant="link" onClick={handleStartNewTransfer}>
          Start New Transfer
        </MotionButton>
      </motion.div>
      {/* Action buttons end */}
    </motion.div>
  );
}
