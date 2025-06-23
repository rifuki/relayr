// React
import { useState } from "react";

// External Libraries
import { CheckCircle2Icon } from "lucide-react";
import { motion } from "motion/react";

// Internal Components
import {
  type StepConfig as StepProps,
  StepButtonsSection,
  StepHeaderSection,
  StepInfoSection,
  StepSectionWrapper,
} from "../../shared";

// API URLs
import { ws_relay_api_url } from "@/lib/api";

// State Management (Store)
import {
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";

// Types
import { Variants } from "motion/react";
import { FileInfoCard } from "../../shared";
import { useSenderWebSocket } from "@/providers/SenderWebSocketProvider";

// Motion Animation
const checkmarkVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [0, 1.2, 1],
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: 0.5,
    },
  },
};

export default function Step2_FileSelected(props: StepProps) {
  const { openConnection } = useSenderWebSocket();

  // Retrieve state from the store
  const initId = useFileSenderStore((state) => state.initId);
  const file = useFileSenderStore((state) => state.file);
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const actions = useFileSenderActions();
  const [isGenerateLinkLoading, setIsGenerateLinkLoading] = useState(false);

  if (!fileMetadata) return;

  const handleGenerateLink = () => {
    setIsGenerateLinkLoading(true);
    if (!file || !fileMetadata) {
      return { errorMessage: "File or file metadata is missing." };
    }
    openConnection(`${ws_relay_api_url}?id=${initId}`);
    setIsGenerateLinkLoading(false);
  };

  const handleUnselectFile = () => {
    actions.setFile(null);
    actions.clearTransferState();
  };

  const buttons = [
    {
      ...props.buttons.generateLink,
      buttonProps: {
        onClick: handleGenerateLink,
        disabled: isGenerateLinkLoading,
      },
    },
    {
      ...props.buttons.removeFile,
      label: "Cancel",
      buttonProps: { onClick: handleUnselectFile },
    },
  ];

  return (
    <StepSectionWrapper>
      <StepHeaderSection
        title={props.header.title}
        description={props.header.description}
      />

      <StepInfoSection
        customFileCard={
          <div className="relative w-full">
            <motion.div
              className="absolute -right-2 -top-2 z-1 bg-white dark:bg-neutral-800 rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
              <FileInfoCard fileMetadata={fileMetadata} />
            </motion.div>
          </div>
        }
      />

      <StepButtonsSection buttons={buttons} />
    </StepSectionWrapper>
  );
}
