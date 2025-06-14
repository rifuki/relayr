// React and Next.js
import { useRouter } from "next/navigation";

// External Libraries
import { CircleCheckIcon } from "lucide-react";
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

// Animation Variants
import { fileListItemVariants } from "@/lib/animations";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

export default function Step4_TransferCompleted(props: StepProps) {
  const router = useRouter();

  // Read data from the receiver store
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);
  const { senderId } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
  const fileUrl = useFileReceiverStore((state) => state.fileUrl);
  // Retrieve receiver progress percentage
  const { receiver: receiverProgress } = useFileReceiverStore(
    (state) => state.transferProgress,
  );
  // Retrieve current offset, transfer status flags
  const {
    receivedBytes,
    isTransferring,
    isTransferError,
    isTransferCompleted,
  } = useFileReceiverStore((state) => state.transferStatus);
  const actions = useFileReceiverActions();

  // If essential data is missing, do not render this component
  if (!fileMetadata || !senderId || !fileUrl) return;

  // Handler to trigger browser download for the received file
  const handleDownloadFile = () => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileMetadata.name || "downloaded-file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  // Handler to reset all relevant states and navigate to the receive page
  const handleReceiveAnotherFile = () => {
    actions.clearTransferState();
    actions.setTransferStatus({
      isTransferCanceled: false,
      isTransferCompleted: false,
    });
    actions.setFileMetadata(null);
    actions.setLastValidSenderId(null);
    router.push("/transfer/receive");
  };

  const buttons = [
    {
      ...props.buttons.downloadFile,
      buttonProps: {
        onClick: handleDownloadFile,
        disabled: isTransferring || isTransferError,
      },
    },
    {
      ...props.buttons.receiveAnotherFile,
      buttonProps: {
        onClick: handleReceiveAnotherFile,
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
        idLabel="Sender"
        idValue={senderId}
        fileMetadata={fileMetadata}
      />

      <StepTransferProgressSection
        progress={receiverProgress}
        transferredBytes={receivedBytes}
        totalSize={fileMetadata.size}
        isTransferring={isTransferring}
        isTransferError={isTransferError}
        isTransferCompleted={isTransferCompleted}
      />

      <StepButtonsSection buttons={buttons} />
    </StepSectionWrapper>
  );
}
