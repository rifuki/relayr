// External Libraries
import { FileCheckIcon } from "lucide-react";
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

  console.log(recipientId);

  return (
    <StepSectionWrapper>
      <StepHeaderSection
        containerClassName="w-full bg-red-500"
        title={props.header.title}
        description={props.header.description}
        customIcon={
          <motion.div
            className="relative flex justify-center items-center"
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
              <div className="bg-green-500 rounded-full p-4">
                <FileCheckIcon className="h-10 w-10 text-white" />
              </div>
            </motion.div>
          </motion.div>
        }
      />

      <StepInfoSection
        containerClassName="bg-green-500"
        idLabel="Recipient"
        idValue={recipientId}
        fileMetadata={fileMetadata}
        transferShareLink={transferShareLink}
        transferShareLinkDisabled={isTransferCompleted}
      />

      <StepTransferProgressSection
        containerClassName="bg-yellow-500"
        progress={receiverProgress}
        transferredBytes={offset}
        totalSize={fileMetadata.size}
        isTransferring={isTransferring}
        isTransferError={isTransferError}
        isTransferCompleted={isTransferCompleted}
      />

      <StepButtonsSection containerClassName="bg-blue-500" buttons={buttons} />
    </StepSectionWrapper>
  );
}
