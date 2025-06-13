// External Libraries
import {
  CircleCheckIcon,
} from "lucide-react";
import { motion } from "motion/react";

// Internal Components
import {
  type StepConfig as StepProps,
  StepButtonsSection,
  StepHeaderSection,
  StepInfoSection,
  StepSectionWrapper,
  StepTransferProgressSection,
} from "../../shared";

// State Management (Store)
import {
  useFileSenderActions,
  useFileSenderStore,
} from "@/stores/useFileSenderStore";

// Animation Variants
import { fileListItemVariants } from "@/lib/animations";

export default function Step6_TransferCompleted(props: StepProps) {
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const { recipientId, transferShareLink } = useFileSenderStore(
    (state) => state.lastTransferInfo,
  );
  // Retrieve receiver progress percentage
  const { receiver: receiverProgress } = useFileSenderStore(
    (state) => state.transferProgress,
  );
  // Retrieve current offset, transfer status flags
  const { offset, isTransferring, isTransferError, isTransferCompleted } =
    useFileSenderStore((state) => state.transferStatus);
  const actions = useFileSenderActions();

  if (
    !fileMetadata ||
    !recipientId ||
    !transferShareLink ||
    !isTransferCompleted
  )
    return null;

  const handleStartNewTransfer = () => {
    actions.setFile(null);
    actions.clearTransferState();
  };

  const buttons = [
    {
      ...props.buttons.startNewTransfer,
      buttonProps: {
        onClick: handleStartNewTransfer,
        disabled: !isTransferCompleted,
      },
    },
  ];

  return (
    <StepSectionWrapper>
      <StepHeaderSection
        title={props.header.title}
        description={props.header.description}
        customIcon={
          <motion.div
            className="relative flex justify-center items-center mt-10 mb-5"
            variants={fileListItemVariants}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-green-500"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 2, 0],
                opacity: [1, 0.8, 0],
                transition: {
                  duration: 1.5,
                  ease: "easeOut",
                },
              }}
            />
            <motion.div
              className="relative z-1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 1],
                opacity: [0, 1],
                transition: {
                  duration: 1.5,
                  ease: "easeOut",
                },
              }}
            >
              <div className="bg-green-500 text-center rounded-full flex justify-center items-center p-3">
                <CircleCheckIcon className="h-17 w-17 text-white " />
              </div>
            </motion.div>
          </motion.div>
        }
      />

      <StepInfoSection
        idLabel="Recipient"
        idValue={recipientId}
        fileMetadata={fileMetadata}
        transferShareLink={transferShareLink}
        transferShareLinkDisabled={isTransferCompleted}
      />

      <StepTransferProgressSection
        progress={receiverProgress}
        transferredBytes={offset}
        totalSize={fileMetadata.size}
        isTransferring={isTransferring}
        isTransferError={isTransferError}
        isTransferCompleted={isTransferCompleted}
      />

      <StepButtonsSection buttons={buttons} />
    </StepSectionWrapper>
  );
}
