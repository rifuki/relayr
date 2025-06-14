// Internal Components
import {
  type StepConfig as StepProps,
  StepButtonsSection,
  StepHeaderSection,
  StepInfoSection,
  StepNoticeSection,
  StepSectionWrapper,
} from "../../shared";

// Context Providers
import { useSenderWebSocket } from "@/providers/SenderWebSocketProvider";

// State Management (Store)
import { useFileSenderStore } from "@/stores/useFileSenderStore";
import { UserCloseRequest } from "@/types/webSocketMessages";

export default function Step3_WaitForReceiver(props: StepProps) {
  const senderWebSocket = useSenderWebSocket();
  if (!senderWebSocket) throw new Error("Sender WebSocket is not available.");

  const { senderId } = useFileSenderStore((state) => state.transferConnection);
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );

  if (!fileMetadata || !senderId || !transferShareLink) return;

  const handleStopSharing = () => {
    senderWebSocket.sendJsonMessage({
      type: "userClose",
      userId: senderId,
      role: "sender",
      reason: "User closed the transfer session.",
    } satisfies UserCloseRequest);
  };

  const buttons = [
    {
      ...props.buttons.revokeLink,
      label: "Cancel",
      buttonProps: {
        onClick: handleStopSharing,
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
        transferShareLink={transferShareLink}
        fileMetadata={fileMetadata}
      />

      <StepNoticeSection message={props.notice} />

      <StepButtonsSection buttons={buttons} />
    </StepSectionWrapper>
  );
}
