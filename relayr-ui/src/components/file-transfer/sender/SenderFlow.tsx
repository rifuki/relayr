import { useEffect, useState } from "react";

import useMeasure from "react-use-measure";

import { TransitionPanel } from "@/components/motion-primitives/transition-panel";
import InitialTransitionLoader from "@/components/motion-primitives/initial-transition-loader";
import { transitionPanelTransition } from "@/lib/animations";
import { useFileSenderStore } from "@/stores/useFileSenderStore";

import {
  Step1_FileSelector,
  Step2_FileSelected,
  Step3_WaitingForRecipient,
  Step4_ReadyToSend,
  Step5_Sending,
  Step6_TransferCompleted,
} from "./steps";

export default function SenderFlow() {
  const file = useFileSenderStore((state) => state.file);

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
      // Step 1: Initial state, no file selected and no transfer connection yet
      if (
        !file &&
        !senderId &&
        !transferShareLink &&
        !recipientId &&
        !isTransferring &&
        !isTransferCompleted
      )
        return 1;

      // Step 2: File is selected, but transfer connection not established yet
      if (
        file &&
        !senderId &&
        !transferShareLink &&
        !recipientId &&
        !isTransferring &&
        !isTransferCompleted
      )
        return 2;

      // Step 3: File selected, sender connection and share link available,
      // but recipient not connected yet
      if (
        file &&
        senderId &&
        transferShareLink &&
        !recipientId &&
        !isTransferring &&
        !isTransferCompleted
      )
        return 3;

      // Step 4: Recipient connected, ready to start transfer
      if (
        file &&
        senderId &&
        transferShareLink &&
        recipientId &&
        !isTransferring &&
        !isTransferCompleted
      )
        return 4;

      // Step 5: Transfer in progress
      if (
        file &&
        senderId &&
        transferShareLink &&
        recipientId &&
        isTransferring &&
        !isTransferCompleted
      )
        return 5;

      // Step 6: Transfer completed
      if (
        file &&
        senderId &&
        transferShareLink &&
        !isTransferring &&
        isTransferCompleted
      )
        return 6;

      // Default fallback: unexpected state
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
    <InitialTransitionLoader key="step0" />,
    <Step1_FileSelector key="step1" />,
    <Step2_FileSelected key="step2" />,
    <Step3_WaitingForRecipient key="step3" />,
    <Step4_ReadyToSend key="step4" />,
    <Step5_Sending key="step5" />,
    <Step6_TransferCompleted key="step6" />,
  ];

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
