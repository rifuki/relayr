// Next.js
import { useRouter } from "next/navigation";

// Internal Components
import {
  StepConfig as StepProps,
  StepButtonsSection,
  StepHeaderSection,
  StepInfoSection,
  StepSectionWrapper,
} from "../../shared";

// API URLs
import { ws_relay_api_url } from "@/lib/api";

// Context Providers
import { useReceiverWebSocket } from "@/providers/ReceiverWebSocketProvider";

// State Management (Store)
import {
  useFileReceiverActions,
  useFileReceiverStore,
} from "@/stores/useFileReceiverStore";

export default function Step1_ReadyToReceive(props: StepProps) {
  const router = useRouter();

  const { openConnection } = useReceiverWebSocket();

  const initId = useFileReceiverStore((s) => s.initId);
  const { senderId } = useFileReceiverStore((s) => s.transferConnection);
  const fileMetadata = useFileReceiverStore((s) => s.fileMetadata);
  const actions = useFileReceiverActions();

  if (!fileMetadata || !senderId) return;

  const handleConnectToSender = () => {
    openConnection(`${ws_relay_api_url}?id=${initId}`);
  };

  const handleBack = () => {
    actions.setFileMetadata(null);
    actions.setTransferConnection({ senderId: null });
    actions.setTransferStatus({ isTransferError: false });
    router.push("/transfer/receive");
  };

  const buttons = [
    {
      ...props.buttons.connectToSender,
      buttonProps: {
        onClick: handleConnectToSender,
      },
    },
    {
      ...props.buttons.back,
      buttonProps: {
        onClick: handleBack,
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
