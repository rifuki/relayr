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

// Context Providers
import { useReceiverWebSocket } from "@/providers/ReceiverWebSocketProvider";

// State Management (Store)
import { useFileReceiverStore } from "@/stores/useFileReceiverStore";

export default function Step1_ReadyToReceive(props: StepProps) {
  const { openConnection } = useReceiverWebSocket();

  const initId = useFileReceiverStore((s) => s.initId);
  const { senderId } = useFileReceiverStore((s) => s.transferConnection);
  const fileMetadata = useFileReceiverStore((s) => s.fileMetadata);

  if (!fileMetadata || !senderId) return;

  const handleConnectToSender = () => {
    openConnection(`${WS_RELAY_API_URL}?id=${initId}`);
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
