// Internal Components
import {
  type StepConfig as StepProps,
  StepButtonsSection,
  StepHeaderSection,
  StepInfoSection,
  StepNoticeSection,
  StepSectionWrapper,
} from "../../shared";

// State Management (Store)
import {
  useFileSenderActions,
  useFileSenderStore,
  useSenderWebSocketHandlers,
} from "@/stores/useFileSenderStore";

export default function Step3_WaitForReceiver(props: StepProps) {
  const fileMetadata = useFileSenderStore((state) => state.fileMetadata);
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const { getWebSocket } = useSenderWebSocketHandlers();
  const actions = useFileSenderActions();

  if (!fileMetadata || !transferShareLink) return;

  const handleStopSharing = () => {
    actions.setErrorMessage(null);

    const ws = getWebSocket?.();
    if (!ws) {
      actions.setErrorMessage("WebSocket is not available.");
      return;
    }

    ws.close(1000, "Sender canceled the transfer link");
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
