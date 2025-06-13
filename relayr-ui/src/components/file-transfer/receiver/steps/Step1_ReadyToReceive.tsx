// Internal Components
import {
  StepConfig as StepProps,
  StepButtonsSection,
  StepHeaderSection,
  StepInfoSection,
  StepSectionWrapper,
} from "../../shared";

// Constants
import { WS_RELAY_API_URL } from "@/lib/constants";
import { useReceiverWebSocket } from "@/providers/ReceiverWebSocketProvider";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

export default function Step1_ReadyToReceive(props: StepProps) {
  const receiverWebSocket = useReceiverWebSocket();
  if (!receiverWebSocket)
    throw new Error("ReceiverWebSocketProvider is not initialized");

  const initId = useFileReceiverStore((state) => state.initId);
  const { senderId } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);
  const actions = useFileReceiverActions();

  if (!fileMetadata || !senderId) return;

  const handleConnectToSender = () => {
    actions.setTransferStatus({
      isTransferCanceled: false,
      isTransferError: false,
    });
    actions.clearTransferState();

    receiverWebSocket.openConnection(`${WS_RELAY_API_URL}?id=${initId}`);
  };

  const buttons = [
    {
      ...props.buttons.connectToSender,
      buttonProps: {
        onClick: handleConnectToSender,
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
        idLabel="Sender"
        idValue={senderId}
        fileMetadata={fileMetadata}
      />

      <StepButtonsSection buttons={buttons} />
    </StepSectionWrapper>
  );
}
