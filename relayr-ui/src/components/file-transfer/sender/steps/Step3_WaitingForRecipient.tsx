import { ClockIcon, Loader2Icon } from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "@components/ui/badge";
import FileCard from "@/components/FileCard";
import { MotionButton } from "@/components/motion-primitives/motion-button";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import TransferHeader from "@/components/TransferHeader";
import ShareableLinkInput from "@/components/ShareableLinkInput";
import {
  useFileSenderActions,
  useFileSenderStore,
  useSenderWebSocketHandlers,
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

export default function Step3_WaitingForRecipient() {
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const { getWebSocket } = useSenderWebSocketHandlers();
  const actions = useFileSenderActions();

  if (!fileMetadata || !transferShareLink) return;

  const handleStopSharing = () => {
    actions.setErrorMessage(null);

    const ws = getWebSocket?.();
    if (!ws) {
      actions.setErrorMessage("WebSocket is not available.");
      return;
    }

    ws.close(1000, "Sender canceled the transfer link");
  };

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
        className="flex flex-col items-center"
        variants={fileListItemVariants}
        animate={clockAnimation}
      >
        <ClockIcon className="h-15 w-15 my-10" />
      </motion.div>

      <motion.div
        className="w-full flex flex-col items-center space-y-5"
        variants={fileListItemVariants}
      >
        <Badge className="p-2 bg-primary/90">
          Recipient ID: <Loader2Icon className="animate-spin" />
        </Badge>

        <ShareableLinkInput text={transferShareLink} className="mt-2" />

        <FileCard fileMetadata={fileMetadata} />
      </motion.div>

      <motion.div
        className="w-full flex flex-col space-y-3 mt-2"
        variants={fileListItemVariants}
      >
        <TextShimmer className="text-center mb-7" duration={1}>
          ⏳ Waiting for the recipient to connect...
        </TextShimmer>
        <MotionButton onClick={handleStopSharing} variant="destructive">
          Stop Sharing
        </MotionButton>
      </motion.div>
    </motion.div>
  );
}
