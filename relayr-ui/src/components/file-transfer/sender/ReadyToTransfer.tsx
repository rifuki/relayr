import { useEffect } from "react";

import { motion, useAnimation } from "motion/react";
import { HardDriveUpload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import FileCard from "@/components/FileCard";
import { MotionButton } from "@/components/motion-primitives/motion-button";
import SenderProgressBar from "@/components/SenderProgressBar";
import TransferHeader from "@/components/TransferHeader";
import ShareableLinkInput from "@/components/ShareableLinkInput";
import { CHUNK_SIZE } from "@/lib/constants";
import {
  CancelSenderReadyRequest,
  RestartTransferRequest,
} from "@/types/webSocketMessages";
import {
  useFileSenderActions,
  useFileSenderStore,
  useWebSocketHandlers,
} from "@/stores/useFileSenderStore";
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";

export default function ReadyToTransfer() {
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
  const { isTransferError } = useFileSenderStore(
    (state) => state.transferStatus,
  );
  const { sendJsonMessage } = useWebSocketHandlers();
  const actions = useFileSenderActions();

  if (!file || !fileMetadata || !transferShareLink || !sendJsonMessage) return;

  const handleSendFile = () => {
    if (!file || !recipientId) {
      const errorMsg = "Missing file or recipient";
      actions.setErrorMessage(errorMsg);
      console.error(errorMsg);
      return;
    }

    actions.clearTransferState();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    actions.setFileTransferInfo({ totalChunks });

    actions.sendNextChunk();
  };

  const handleCancelSenderReady = () => {
    sendJsonMessage({
      type: "cancelSenderReady",
    } satisfies CancelSenderReadyRequest);
    actions.clearTransferState();
    actions.setTransferConnection({ recipientId: null });
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
        <FileCard fileMetadata={fileMetadata} />
      </motion.div>

      <SenderProgressBar />

      <motion.div
        variants={fileListItemVariants}
        className="w-full flex flex-col space-y-3 mt-2"
      >
        {isTransferError ? (
          <MotionButton onClick={handleRestartTransfer}>
            Restart Transfer
          </MotionButton>
        ) : (
          <MotionButton
            animate={controls}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleSendFile}
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
