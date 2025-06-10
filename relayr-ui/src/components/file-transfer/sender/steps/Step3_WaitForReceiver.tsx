// Internal Components
import {
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

// Types
import { type StepConfig as StepProps } from "../step-config";

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
        containerClassName="bg-red-500"
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
        containerClassName="bg-green-500"
        transferShareLink={transferShareLink}
        fileMetadata={fileMetadata}
      />

      <StepNoticeSection
        containerClassName="bg-yellow-500"
        message={props.notice}
      />

      <StepButtonsSection containerClassName="bg-blue-500" buttons={buttons} />
    </StepSectionWrapper>
  );
}
