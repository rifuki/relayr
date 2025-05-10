import { useState } from "react";

import { ClockIcon, Loader2Icon } from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@components/ui/badge";
import { Button } from "@/components/ui/button";
import FileCard from "@/components/FileCard";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import TransferHeader from "@/components/TransferHeader";
import ShareableLinkInput from "@/components/ShareableLinkInput";
import {
  useFileSenderActions,
  useFileSenderStore,
  useWebSocketHandlers,
} from "@/stores/useFileSenderStore";
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";

// Clock animation for waiting state
const clockAnimation = {
  rotate: [0, 360],
  transition: {
    repeat: Infinity,
    duration: 7.5,
    ease: "linear",
  },
};

const MotionButton = motion.create(Button);

export default function WaitingForRecipient() {
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const { senderId } = useFileSenderStore((state) => state.transferConnection);

  const { getWebSocket } = useWebSocketHandlers();
  const actions = useFileSenderActions();

  const [isLoading, setIsLoading] = useState(false);

  const handleStopSharing = () => {
    if (isLoading) return;

    setIsLoading(true);

    const ws = getWebSocket?.();
    if (!ws) {
      actions.setErrorMessage("WebSocket is not available.");
      setIsLoading(false);
      return;
    }

    ws.close(1000, "Sender canceled the transfer link");

    if (!transferShareLink || senderId) {
      actions.setErrorMessage("Transfer stopped, all data reset.");
    }

    setIsLoading(false);
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
        title="Waiting for Recipient"
        description="Share this link with the recipient and wait for them to connect"
      />

      <motion.div
        className="flex flex-col items-center my-10"
        variants={fileListItemVariants}
        animate={clockAnimation}
      >
        <ClockIcon className="h-10 w-10 text-primary" />
      </motion.div>

      <motion.div
        className="w-full flex flex-col items-center space-y-5"
        variants={fileListItemVariants}
      >
        <Badge className="p-2 bg-primary/90">
          Recipient ID: <Loader2Icon className="animate-spin" />
        </Badge>

        <ShareableLinkInput value={transferShareLink} />

        <FileCard fileMetadata={fileMetadata} />
      </motion.div>

      <motion.div
        className="w-full flex flex-col space-y-3 mt-2"
        variants={fileListItemVariants}
      >
        <TextShimmer className="text-center mb-7" duration={1}>
          ⏳ Waiting for the recipient to connect...
        </TextShimmer>
        <MotionButton
          onClick={handleStopSharing}
          disabled={isLoading}
          variant="destructive"
          className="w-full cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Stop Sharing
        </MotionButton>
      </motion.div>
    </motion.div>
  );
}
