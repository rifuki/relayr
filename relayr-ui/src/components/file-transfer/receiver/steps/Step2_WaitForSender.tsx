// Internal Components
import { useReceiverWebSocket } from "@/providers/ReceiverWebSocketProvider";
import {
  StepConfig as StepProps,
  StepButtonsSection,
  StepHeaderSection,
  StepInfoSection,
  StepNoticeSection,
  StepSectionWrapper,
} from "../../shared";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

// Types
import { CancelRecipientReadyRequest } from "@/types/webSocketMessages";

export default function Step2_WaitForSender(props: StepProps) {
  const receiverWebSocket = useReceiverWebSocket();
  if (!receiverWebSocket)
    throw new Error("Receiver WebSocket is not available");

  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);
  const { senderId, recipientId } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
  const actions = useFileReceiverActions();

  if (!senderId || !fileMetadata) return;

  const handleCancelRecipientReady = () => {
    receiverWebSocket.sendJsonMessage({
      type: "cancelRecipientReady",
      senderId,
    } satisfies CancelRecipientReadyRequest);

    receiverWebSocket.sendJsonMessage({
      type: "cancelTransfer",
      userId: recipientId,
      role: "recipient",
      reason: "Recipient canceled before transfer started",
    });

    actions.setTransferConnection({ recipientId: null, isConnected: false });
    actions.setErrorMessage(null);
  };

  const buttons = [
    {
      ...props.buttons.cancelRecipientReady,
      buttonProps: {
        onClick: handleCancelRecipientReady,
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
          animate: { rotate: [0, 360] },
          transition: {
            repeat: Infinity,
            duration: 7.5,
            ease: "linear",
          },
        }}
      />

      <StepInfoSection
        idLabel="Sender"
        idValue={senderId}
        fileMetadata={fileMetadata}
      />

      <StepNoticeSection message={props.notice} />

      <StepButtonsSection buttons={buttons} />
    </StepSectionWrapper>
  );
}
