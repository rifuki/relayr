import { useEffect, useState } from "react";

import useMeasure from "react-use-measure";

import { TransitionPanel } from "@/components/motion-primitives/transition-panel";
import InitialTransitionLoader from "@/components/motion-primitives/initial-transition-loader";
import { useFileSenderStore } from "@/stores/useFileSenderStore";
import { transitionPanelTransition } from "@/lib/animations";
import FileSelector from "./FileSelector";
import SelectedFile from "./SelectedFile";
import ReadyToTransfer from "./ReadyToTransfer";
import WaitingForRecipient from "./WaitingForRecipient";
import TransferInProgress from "./TransferInProgress";
import SenderTransferCompleted from "./SenderTransferCompleted";

export default function SendFlow() {
  const file = useFileSenderStore((state) => state.file);
  const errorMessage = useFileSenderStore((state) => state.errorMessage);

  const { senderId, recipientId } = useFileSenderStore(
    (state) => state.transferConnection,
  );
  const transferShareLink = useFileSenderStore(
    (state) => state.transferShareLink,
  );
  const { isTransferring, isTransferCompleted } = useFileSenderStore(
    (state) => state.transferStatus,
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ref, bounds] = useMeasure();

  useEffect(() => {
    function determineStep() {
      // File selection state

      if (
        !file &&
        !senderId &&
        !transferShareLink &&
        !recipientId &&
        !isTransferring &&
        !isTransferCompleted
      )
        return 1;

      // File selected state
      if (
        file &&
        !senderId &&
        !transferShareLink &&
        !recipientId &&
        !isTransferring &&
        !isTransferCompleted
      )
        return 2;

      // Waiting for recipient state
      if (
        file &&
        senderId &&
        transferShareLink &&
        !recipientId &&
        !isTransferring &&
        !isTransferCompleted
      )
        return 3;

      // Ready to transfer state
      if (
        file &&
        senderId &&
        transferShareLink &&
        recipientId &&
        !isTransferring &&
        !isTransferCompleted
      )
        return 4;

      if (
        file &&
        senderId &&
        transferShareLink &&
        recipientId &&
        isTransferring &&
        !isTransferCompleted
      )
        return 5;

      // Transfer completed state
      if (
        file &&
        senderId &&
        transferShareLink &&
        !isTransferring &&
        isTransferCompleted
      )
        return 6;

      return 0;
    }

    const newStep = determineStep();
    if (newStep !== currentStep) {
      setDirection(newStep > currentStep ? 1 : -1);
      setCurrentStep(newStep);
    }
  }, [
    file,
    senderId,
    transferShareLink,
    recipientId,
    isTransferring,
    isTransferCompleted,
    currentStep,
  ]);

  const FLOW_COMPONENTS = [
    <InitialTransitionLoader key="initialTransitionLoader" />,
    <FileSelector key="fileSelector" />,
    <SelectedFile key="selectedFile" />,
    <WaitingForRecipient key="waitingForRecipient" />,
    <ReadyToTransfer key="readyToTransfer" />,
    <TransferInProgress key="TransferInProgress" />,
    <SenderTransferCompleted key="senderTransferCompleted" />,
  ];

  console.log(errorMessage);

  // Fallback (should never happen ideally)
  return (
    <TransitionPanel
      activeIndex={currentStep}
      variants={{
        enter: (direction) => ({
          x: direction > 0 ? 400 : -400,
          opacity: 0,
          height: bounds.height > 0 ? bounds.height : "auto",
          position: "initial",
        }),
        center: {
          zIndex: 1,
          x: 0,
          opacity: 1,
          height: bounds.height > 0 ? bounds.height : "auto",
        },
        exit: (direction) => ({
          zIndex: 0,
          x: direction < 0 ? 400 : -400,
          opacity: 0,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
        }),
      }}
      transition={transitionPanelTransition}
      custom={direction}
    >
      {FLOW_COMPONENTS.map((component, index) => (
        <div
          key={index}
          ref={index === currentStep ? ref : undefined}
          className="w-full"
        >
          {component}
        </div>
      ))}
    </TransitionPanel>
  );
}
