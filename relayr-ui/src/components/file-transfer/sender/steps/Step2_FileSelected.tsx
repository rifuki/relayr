// React
import { useState } from "react";

// External Libraries
import { CheckCircle2Icon } from "lucide-react";
import { motion } from "motion/react";

// Internal Components
import {
  StepButtonsSection,
  StepHeaderSection,
  StepInfoSection,
  StepSectionWrapper,
} from "../../shared";

// Constants
import { WS_RELAY_API_URL } from "@/lib/constants";

// State Management (Store)
import {
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";

// Types
import { StepButtonConfig, type StepConfig as StepProps } from "../step-config";
import { TransferFileCard } from "../../shared";

// Motion Animation
const checkmarkVariants = {
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

/**
 * Step2_FileSelected component represents the second step in the file sending process.
 * It displays the selected file's metadata, a button to generate a transfer link,
 * and a button to remove the selected file.
 * The component uses motion for animations and ShadCN UI components for styling.
 *
 * @returns JSX.Element The rendered component.
 */
export default function Step2_FileSelected(props: StepProps) {
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
    actions.setWebSocketUrl(`${WS_RELAY_API_URL}?id=${initId}`);
    setIsGenerateLinkLoading(false);
  };

  const handleUnselectFile = () => {
    actions.setFile(null);
    actions.clearTransferState();
  };

  const buttons: StepButtonConfig[] = [
    {
      ...props.buttons.generateLink,
      label: "Next",
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
        containerClassName="bg-red-500"
        title={props.header.title}
        description={props.header.description}
      />

      <StepInfoSection
        containerClassName="bg-green-500"
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
              <TransferFileCard fileMetadata={fileMetadata} />
            </motion.div>
          </div>
        }
      />

      <StepButtonsSection containerClassName="bg-blue-500" buttons={buttons} />
    </StepSectionWrapper>
  );
}
