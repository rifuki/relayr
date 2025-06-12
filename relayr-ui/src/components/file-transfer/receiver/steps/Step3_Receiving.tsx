// Internal Components
import { useReceiverWebSocket } from "@/providers/ReceiverWebSocketProvider";
import {
  type StepConfig as StepProps,
  StepButtonsSection,
  StepHeaderSection,
  StepInfoSection,
  StepNoticeSection,
  StepSectionWrapper,
  StepTransferProgressSection,
} from "../../shared";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

// Types
import { CancelRecipientTransferRequest } from "@/types/webSocketMessages";

export default function Step3_Receiving(props: StepProps) {
  const receiverWebSocket = useReceiverWebSocket();
  if (!receiverWebSocket)
    throw new Error("Receiver WebSocket is not available");

  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);
  const { senderId } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
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

  if (!senderId || !fileMetadata) return;

  const handleAbortTransfer = () => {
    receiverWebSocket.sendJsonMessage({
      type: "cancelRecipientTransfer",
      senderId,
    } satisfies CancelRecipientTransferRequest);
    actions.setTransferStatus({ isTransferCanceled: true });
    actions.setErrorMessage("You canceled the transfer");
  };

  const buttons = [
    {
      ...props.buttons.abortTransfer,
      buttonProps: {
        onClick: handleAbortTransfer,
      },
    },
  ];

  return (
    <StepSectionWrapper>
      <StepHeaderSection
        title={props.header.title}
        description={props.header.description}
        Icon={props.Icon}
        iconAnimation={{
          animate: { scale: [1, 1, 1, 1], rotate: [0, 5, -5, 0] },
          transition: {
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 1,
          },
        }}
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

      <StepNoticeSection message={props.notice} />

      <StepButtonsSection buttons={buttons} />
    </StepSectionWrapper>
  );
}
