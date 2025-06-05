// External Libraries
import { CloudLightningIcon } from "lucide-react";
import { motion } from "motion/react";

// ShadCN UI Components
import { Badge } from "@/components/ui/badge";

// Motion-Primitives UI Components
import { MotionButton } from "@/components/animations/motion-button";

// Internal Components
import { TransferFileCard, TransferHeader } from "../../shared";

// Animation Variants
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";

// Constants
import { WS_RELAY_API_URL } from "@/lib/constants";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

/**
 * Step1_ReadyToReceive component represents the first step in the file receiving process.
 * It displays a header, an icon, and a button to connect to the sender's server.
 * The component uses motion for animations and ShadCN UI components for styling.
 *
 * @returns JSX.Element The rendered component.
 */
export default function Step1_ReadyToReceive() {
  const initId = useFileReceiverStore((state) => state.initId);
  const { senderId } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);
  const actions = useFileReceiverActions();

  if (!fileMetadata) return;

  const handleConnectToSender = () => {
    actions.setTransferStatus({
      isTransferCanceled: false,
      isTransferError: false,
    });
    actions.clearTransferState();
    actions.setWebSocketUrl(`${WS_RELAY_API_URL}?id=${initId}`);
  };

  return (
    <motion.div
      className="flex flex-col items-center space-y-5"
      variants={fileListWrapperVariants}
      initial="hidden"
      animate="show"
    >
      <TransferHeader
        title="Ready to Receive"
        description="Connect to the server to receive the file"
      />

      <motion.div variants={fileListItemVariants}>
        <CloudLightningIcon className="h-15 w-15 my-10" />
      </motion.div>

      <motion.div
        className="w-full flex flex-col items-center space-y-5"
        variants={fileListItemVariants}
      >
        <Badge className="p-2 bg-primary/90">Sender ID: {senderId}</Badge>

        <TransferFileCard fileMetadata={fileMetadata} />
      </motion.div>

      <motion.div
        className="w-full flex flex-col space-y-3 mt-2"
        variants={fileListItemVariants}
      >
        <MotionButton onClick={handleConnectToSender}>
          Connect to Server
        </MotionButton>
      </motion.div>
    </motion.div>
  );
}
