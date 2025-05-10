import { motion } from "motion/react";
import { FileCheckIcon, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TransferHeader from "@/components/TransferHeader";
import FileCard from "@/components/FileCard";
import {
  useFileSenderActions,
  useFileSenderStore,
  useWebSocketHandlers,
} from "@/stores/useFileSenderStore";
import { CHUNK_SIZE } from "@/lib/constants";
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";
import { MotionButton } from "@/components/motion-primitives/motion-button";
import SenderProgressBar from "@/components/SenderProgressBar";

const burstAnimation = {
  scale: [1, 1.5, 0],
  opacity: [1, 0.8, 0],
  transition: {
    duration: 1.5,
    ease: "easeOut",
  },
};

const successAnimation = {
  scale: [0, 1.2, 1],
  opacity: [0, 1],
  rotate: [0, 0],
  transition: {
    duration: 0.5,
    ease: "easeOut",
  },
};

export default function TransferCompleted() {
  const testFile = useFileSenderStore((state) => state.file);

  const { recipientId } = useFileSenderStore(
    (state) => state.transferConnection,
  );
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const actions = useFileSenderActions();
  const { getWebSocket } = useWebSocketHandlers();

  const testHandleSendFile = () => {
    if (!testFile || !recipientId) return;

    actions.resetTransferStatus();
    const totalChunks = Math.ceil(testFile.size / CHUNK_SIZE);
    actions.setTransferStatus({ totalChunks });

    actions.sendNextChunk();
  };

  const handleResetTransfer = () => {
    const ws = getWebSocket?.();
    if (!ws) {
      actions.setErrorMessage("WebSocket is not available.");
      return;
    }

    if (ws.readyState === WebSocket.OPEN) {
      actions.setWebSocketUrl(null);
      ws.close(
        1000,
        "Sender success reset transfer, closing WebSocket connection.",
      );
    }

    actions.setFile(null);
    actions.setTransferConnection({ senderId: null, recipientId: null });
    actions.setTransferShareLink(null);
    actions.resetTransferStatus();
  };

  if (!fileMetadata || !transferShareLink) return;

  return (
    <motion.div
      className="flex flex-col items-center space-y-5"
      variants={fileListWrapperVariants}
      initial="hidden"
      animate="show"
    >
      <TransferHeader
        title="Transfer Successful"
        description="Your file has been successfully transferred"
      />

      <motion.div
        className="relative flex justify-center items-center my-10"
        variants={fileListItemVariants}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-green-500"
          initial={{ scale: 0, opacity: 0 }}
          animate={burstAnimation}
        />
        <motion.div
          className="bg-white dark:bg-zinc-800 rounded-full p-2 relative z-10"
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
        <FileCard fileMetadata={fileMetadata} />

        <SenderProgressBar />

        <Input value={transferShareLink} className="w-full" readOnly disabled />
      </motion.div>

      <motion.div
        className="w-full flex flex-col space-y-3 mt-2"
        variants={fileListItemVariants}
      >
        <MotionButton
          onClick={testHandleSendFile}
          variant="ghost"
          className="w-full cursor-pointer"
        >
          Start Transfer
        </MotionButton>

        <MotionButton
          onClick={handleResetTransfer}
          className="w-full cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw className="h-4 w-4" />
          Send Another File
        </MotionButton>
      </motion.div>
    </motion.div>
  );
}
