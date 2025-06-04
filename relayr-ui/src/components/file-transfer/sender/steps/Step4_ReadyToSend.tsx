// React
import { useEffect } from "react";

// External Libraries
import { motion, useAnimation } from "motion/react";
import { HardDriveUpload } from "lucide-react";

// ShadCN UI Components
import { Badge } from "@/components/ui/badge";

// Motion-Primitives UI Components
import { MotionButton } from "@/components/motion-primitives/motion-button";

// Internal Components
import ShareableLinkInput from "@/components/ShareableLinkInput";
import { SenderTransferProgress } from "../components";
import { TransferFileCard, TransferHeader } from "../../shared";

// Animation Variants
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";

// Constants
import { CHUNK_SIZE } from "@/lib/constants";

// State Management (Store)
import {
  useFileSenderActions,
  useFileSenderStore,
  useSenderWebSocketHandlers,
} from "@/stores/useFileSenderStore";

// Types
import {
  CancelSenderReadyRequest,
  RestartTransferRequest,
} from "@/types/webSocketMessages";

/**
 * Step4_ReadyToSend component represents the fourth step in the file sending process.
 * It displays a header, a hard drive upload icon, recipient ID, shareable link input,
 * and file metadata.
 * It allows the sender to start the file transfer or cancel the setup.
 *
 * @returns JSX.Element The rendered component.
 */
export default function Step4_ReadyToSend() {
  const controls = useAnimation();

  const handleMouseEnter = () => {
    controls.stop();
    controls.start({ rotate: 0 });
  };

  const handleMouseLeave = () => {
    controls.start({
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
      },
    });
  };

  useEffect(() => {
    controls.start({
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
      },
    });
  }, [controls]);

  const file = useFileSenderStore((state) => state.file);
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const { recipientId } = useFileSenderStore(
    (state) => state.transferConnection,
  );
  const { isTransferring, isTransferError } = useFileSenderStore(
    (state) => state.transferStatus,
  );
  const { sendJsonMessage } = useSenderWebSocketHandlers();
  const actions = useFileSenderActions();

  if (!file || !fileMetadata || !transferShareLink || !sendJsonMessage) return;

  const handleSendFile = () => {
    if (!file || !recipientId) {
      const errorMsg = "Missing file or recipient";
      actions.setErrorMessage(errorMsg);
      console.error(errorMsg);
      return;
    }

    actions.setErrorMessage(null);
    actions.setTransferStatus({
      isTransferring: true,
      isTransferCanceled: false,
      isTransferError: false,
    });
    actions.clearTransferState();

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    actions.setFileTransferInfo({ totalChunks });

    actions.sendNextChunk();
  };

  const handleCancelSenderReady = () => {
    sendJsonMessage({
      type: "cancelSenderReady",
    } satisfies CancelSenderReadyRequest);
    actions.setTransferConnection({ recipientId: null });
    actions.clearTransferState();
    actions.setErrorMessage(null);
  };

  const handleRestartTransfer = () => {
    sendJsonMessage({
      type: "restartTransfer",
    } satisfies RestartTransferRequest);

    handleSendFile();
  };

  return (
    <motion.div
      className="flex flex-col items-center space-y-5"
      variants={fileListWrapperVariants}
      initial="hidden"
      animate="show"
    >
      <TransferHeader
        title="Ready to Transfer"
        description="Recipient connected. You can now transfer the file"
      />

      <motion.div variants={fileListItemVariants}>
        <HardDriveUpload className="h-15 w-15 my-10" />
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
        {isTransferError ? (
          <MotionButton
            onClick={handleRestartTransfer}
            disabled={isTransferring}
          >
            Restart Transfer
          </MotionButton>
        ) : (
          <MotionButton
            animate={controls}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleSendFile}
            disabled={isTransferring}
          >
            Start Transfer
          </MotionButton>
        )}

        <MotionButton onClick={handleCancelSenderReady} variant="destructive">
          Cancel Transfer Setup
        </MotionButton>
      </motion.div>
    </motion.div>
  );
}
