import { useEffect } from "react";

import { useShallow } from "zustand/shallow";
import { CloudLightningIcon } from "lucide-react";
import { motion, useAnimation } from "motion/react";

import { Badge } from "@/components/ui/badge";
import FileCard from "@/components/FileCard";
import { Button } from "@/components/ui/button";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import SenderProgressBar from "@/components/SenderProgressBar";
import TransferHeader from "@/components/TransferHeader";
import ShareableLinkInput from "@/components/ShareableLinkInput";
import { CHUNK_SIZE } from "@/lib/constants";
import {
  CancelSenderReadyRequest,
  cancelSenderTransferRequest,
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
import { MotionButton } from "@/components/motion-primitives/motion-button";

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

  const {
    file,
    fileMetadata,
    transferShareLink,
    recipientId,
    isTransferring,
    isRecipientComplete,
  } = useFileSenderStore(
    useShallow((state) => ({
      file: state.file,
      fileMetadata: state.fileMetadata,
      transferShareLink: state.transferShareLink,
      recipientId: state.transferConnection.recipientId,
      isTransferring: state.transferStatus.isTransferring,
      isRecipientComplete: state.transferStatus.isRecipientComplete,
    })),
  );

  const { sendJsonMessage } = useWebSocketHandlers();
  const actions = useFileSenderActions();

  if (!file || !sendJsonMessage) return;

  const handleSendFile = () => {
    if (!file || !recipientId) {
      const errorMsg = "Missing file or recipient";
      actions.setErrorMessage(errorMsg);
      console.error(errorMsg);
      return;
    }

    actions.resetTransferStatus();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    actions.setTransferStatus({ totalChunks });

    actions.sendNextChunk();
  };

  const handleCancelSenderReady = () => {
    sendJsonMessage({
      type: "cancelSenderReady",
    } satisfies CancelSenderReadyRequest);
    actions.setTransferConnection({ recipientId: null });
  };

  const handleCancelSenderTransfer = () => {
    sendJsonMessage({
      type: "cancelSenderTransfer",
    } satisfies cancelSenderTransferRequest);
    actions.resetTransferStatus();
    actions.setTransferStatus({ isCanceled: true });
  };

  if (!transferShareLink || !fileMetadata) return;

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
        <CloudLightningIcon className="h-10 w-10 my-10" />
      </motion.div>

      <motion.div
        variants={fileListItemVariants}
        className="w-full flex flex-col items-center space-y-5"
      >
        <Badge className="p-2 bg-primary/90">Recipient ID: {recipientId}</Badge>
        <ShareableLinkInput value={transferShareLink} />
        <FileCard fileMetadata={fileMetadata} />
      </motion.div>

      <SenderProgressBar />

      <motion.div
        variants={fileListItemVariants}
        className="w-full flex flex-col space-y-3 mt-2"
      >
        {!isTransferring && !isRecipientComplete ? (
          <MotionButton
            animate={controls}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleSendFile}
            className="w-full hover:cursor-pointer"
          >
            Start Transfer
          </MotionButton>
        ) : (
          <TextShimmer className="text-center" duration={1}>
            ⚠️ Transfer in progress — stay on this page.
          </TextShimmer>
        )}
        {!isTransferring && !isRecipientComplete ? (
          <Button
            onClick={handleCancelSenderReady}
            variant="destructive"
            className="w-full hover:cursor-pointer"
          >
            Cancel Transfer Setup
          </Button>
        ) : (
          <Button
            onClick={handleCancelSenderTransfer}
            variant="destructive"
            className="w-full hover:cursor-pointer"
          >
            Abort Transfer
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
