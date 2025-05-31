import { useState } from "react";

import { CheckCircle2Icon } from "lucide-react";
import { motion } from "motion/react";

import FileCard from "@/components/FileCard";
import TransferHeader from "@/components/TransferHeader";
import { MotionButton } from "@/components/motion-primitives/motion-button";
import { WS_RELAY_API_URL } from "@/lib/constants";
import {
  fileListItemVariants,
  fileListWrapperVariants,
} from "@/lib/animations";
import {
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";

const checkmarkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [0, 1.2, 1],
    opacity: 1,
    transition: {
      duration: 0.5,
      case: "easeOut",
      delay: 0.5,
    },
  },
};

export default function SelectedFile() {
  const initId = useFileSenderStore((state) => state.initId);
  const file = useFileSenderStore((state) => state.file);
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const actions = useFileSenderActions();
  const [isGenerateLinkLoading, setIsGenerateLinkLoading] = useState(false);

  if (!fileMetadata) return;

  const handleGenerateTransferShareLink = () => {
    setIsGenerateLinkLoading(true);
    if (!file || !fileMetadata) {
      return { errorMessage: "File or file metadata is missing." };
    }
    actions.setWebSocketUrl(`${WS_RELAY_API_URL}?id=${initId}`);
    setIsGenerateLinkLoading(false);
  };

  const handleUnselectFile = () => {
    actions.setFile(null);
  };

  return (
    <motion.div
      className="flex flex-col items-center space-y-5"
      variants={fileListWrapperVariants}
      initial="hidden"
      animate="show"
    >
      <TransferHeader
        title="File Selected"
        description="Ready to generate a transfer link "
      />

      <motion.div className="relative w-full" variants={fileListItemVariants}>
        <motion.div
          className="absolute -right-2 -top-2 z-1 bg-white dark:bg-zinc-800 rounded-full"
          variants={checkmarkVariants}
          initial="hidden"
          animate="visible"
        >
          <CheckCircle2Icon className="h-8 w-8 text-green-500" />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <FileCard fileMetadata={fileMetadata} />
        </motion.div>
      </motion.div>

      <motion.div
        className="w-full flex flex-col space-y-3 mt-2"
        variants={fileListItemVariants}
      >
        <MotionButton
          onClick={() => handleGenerateTransferShareLink()}
          disabled={isGenerateLinkLoading}
        >
          Generate Transfer Link
        </MotionButton>
        <MotionButton onClick={handleUnselectFile} variant="destructive">
          Remove File
        </MotionButton>
      </motion.div>
    </motion.div>
  );
}
