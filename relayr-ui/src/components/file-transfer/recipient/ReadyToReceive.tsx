import { CloudLightningIcon } from "lucide-react";
import { motion } from "motion/react";

import FileCard from "@/components/FileCard";
import { MotionButton } from "@/components/motion-primitives/motion-button";
import TransferHeader from "@/components/TransferHeader";
import { Badge } from "@/components/ui/badge";
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";
import { WS_RELAY_API_URL } from "@/lib/constants";
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

export default function ReadyToReceive() {
  const initId = useFileReceiverStore((state) => state.initId);
  const { senderId } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);

  const actions = useFileReceiverActions();

  if (!fileMetadata) return;

  const handleConnectToSender = () => {
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

        <FileCard fileMetadata={fileMetadata} />
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
