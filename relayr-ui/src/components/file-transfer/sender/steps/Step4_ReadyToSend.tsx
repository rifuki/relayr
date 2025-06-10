// React
import { useEffect } from "react";

// External Libraries
import { useAnimation } from "motion/react";

// Internal Components
import {
  type StepConfig as StepProps,
  StepButtonsSection,
  StepHeaderSection,
  StepInfoSection,
  StepSectionWrapper,
  StepTransferProgressSection,
} from "../../shared";

// Constants
import { CHUNK_SIZE } from "@/lib/constants";

// State Management (Store)
import {
  useFileSenderActions,
  useFileSenderStore,
  useSenderWebSocketHandlers,
} from "@/stores/useFileSenderStore";

// Types
import {
  CancelSenderReadyRequest,
  RestartTransferRequest,
} from "@/types/webSocketMessages";

export default function Step4_ReadyToSend(props: StepProps) {
  const controls = useAnimation();
  const handleMouseEnter = () => {
    controls.stop();
    controls.start({ rotate: 0 });
  };
  const handleMouseLeave = () => {
    controls.start({
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
      },
    });
  };

  useEffect(() => {
    controls.start({
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
      },
    });
  }, [controls]);

  const file = useFileSenderStore((state) => state.file);
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const { recipientId } = useFileSenderStore(
    (state) => state.transferConnection,
  );
  // Retrieve receiver progress percentage
  const { receiver: receiverProgress } = useFileSenderStore(
    (state) => state.transferProgress,
  );
  // Retrieve current offset, transfer status flags
  const { offset, isTransferring, isTransferError, isTransferCompleted } =
    useFileSenderStore((state) => state.transferStatus);
  const { sendJsonMessage } = useSenderWebSocketHandlers();
  const actions = useFileSenderActions();

  if (
    !file ||
    !fileMetadata ||
    !transferShareLink ||
    !recipientId ||
    !sendJsonMessage
  )
    return;

  const handleSendFile = () => {
    if (!file || !recipientId) {
      const errorMsg = "Missing file or recipient";
      actions.setErrorMessage(errorMsg);
      console.error(errorMsg);
      return;
    }

    actions.setErrorMessage(null);
    actions.setTransferStatus({
      isTransferring: true,
      isTransferCanceled: false,
      isTransferError: false,
    });
    actions.clearTransferState();

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    actions.setFileTransferInfo({ totalChunks });

    actions.sendNextChunk();
  };

  const handleCancelSenderReady = () => {
    sendJsonMessage({
      type: "cancelSenderReady",
    } satisfies CancelSenderReadyRequest);
    actions.setTransferConnection({ recipientId: null });
    actions.clearTransferState();
    actions.setErrorMessage(null);
  };

  const handleRestartTransfer = () => {
    sendJsonMessage({
      type: "restartTransfer",
    } satisfies RestartTransferRequest);

    handleSendFile();
  };

  const buttons = [
    isTransferError
      ? {
          ...props.buttons.restartTransfer,
          buttonProps: {
            onClick: handleRestartTransfer,
            disabled: isTransferring,
          },
        }
      : {
          ...props.buttons.startTransfer,
          buttonProps: {
            animate: controls,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: handleSendFile,
            disabled: isTransferring,
          },
        },
    {
      ...props.buttons.cancelTransfer,
      label: "Cancel",
      buttonProps: {
        onClick: handleCancelSenderReady,
      },
    },
  ];

  return (
    <StepSectionWrapper>
      <StepHeaderSection
        title={props.header.title}
        description={props.header.description}
        Icon={props.Icon}
      />

      <StepInfoSection
        idLabel="Recipient"
        idValue={recipientId}
        fileMetadata={fileMetadata}
        transferShareLink={transferShareLink}
      />

      <StepTransferProgressSection
        progress={receiverProgress}
        transferredBytes={offset}
        totalSize={fileMetadata.size}
        isTransferring={isTransferring}
        isTransferError={isTransferError}
        isTransferCompleted={isTransferCompleted}
        idleText="Click to start transfer"
      />

      <StepButtonsSection buttons={buttons} />
    </StepSectionWrapper>
  );
}
