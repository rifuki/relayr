// Internal Components
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
  useFileSenderActions,
  useFileSenderStore,
  useSenderWebSocketHandlers,
} from "@/stores/useFileSenderStore";

// Types
import { CancelSenderTransferRequest } from "@/types/webSocketMessages";

export default function Step5_Sending(props: StepProps) {
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
    !fileMetadata ||
    !transferShareLink ||
    !recipientId ||
    !isTransferring ||
    !sendJsonMessage
  )
    return;

  const handleAbortTransfer = () => {
    sendJsonMessage({
      type: "cancelSenderTransfer",
    } satisfies CancelSenderTransferRequest);
    actions.setTransferStatus({ isTransferCanceled: true });
    actions.setErrorMessage("You canceled the transfer");
    console.warn("Transfer has been canceled. No more chunks will be sent.");
  };

  const buttons = [
    {
      ...props.buttons.abortTransfer,
      buttonProps: {
        onClick: handleAbortTransfer,
        disabled: !isTransferring,
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
      />

      <StepNoticeSection message={props.notice} />

      <StepButtonsSection buttons={buttons} />
    </StepSectionWrapper>
  );
}
