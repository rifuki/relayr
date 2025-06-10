// React and Next.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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

  // Save the last valid sender ID for future access (e.g., prefill)
  useEffect(() => {
    actions.setLastValidSenderId(senderId);
  }, [actions, senderId]);

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
    actions.setIsReceiverFlowActive(false);
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
        containerClassName="bg-red-500"
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
        idLabel="Sender"
        idValue={senderId}
        fileMetadata={fileMetadata}
      />

      <StepTransferProgressSection
        containerClassName="bg-yellow-500"
        progress={receiverProgress}
        transferredBytes={receivedBytes}
        totalSize={fileMetadata.size}
        isTransferring={isTransferring}
        isTransferError={isTransferError}
        isTransferCompleted={isTransferCompleted}
      />

      <StepButtonsSection containerClassName="bg-blue-500" buttons={buttons} />
    </StepSectionWrapper>
  );
}
