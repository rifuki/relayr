// React
import { useState } from "react";

// External Libraries
import { CheckCircle2Icon } from "lucide-react";
import { motion } from "motion/react";

// Motion-Primitives UI Components
import { MotionButton } from "@/components/motion-primitives/motion-button";

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
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";

// Motion Animation
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

/**
 * Step2_FileSelected component represents the second step in the file sending process.
 * It displays the selected file's metadata, a button to generate a transfer link,
 * and a button to remove the selected file.
 * The component uses motion for animations and ShadCN UI components for styling.
 *
 * @returns JSX.Element The rendered component.
 */
export default function Step2_FileSelected() {
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
          className="absolute -right-2 -top-2 z-1 bg-white dark:bg-neutral-800 rounded-full"
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
          <TransferFileCard fileMetadata={fileMetadata} />
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
