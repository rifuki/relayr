import { useEffect, useState } from "react";

import useMeasure from "react-use-measure";

import { TransitionPanel } from "@/components/motion-primitives/transition-panel";
import InitialTransitionLoader from "@/components/motion-primitives/initial-transition-loader";
import { useFileReceiverStore } from "@/stores/useFileReceiverStore";
import { transitionPanelTransition } from "@/lib/animations";
import ReadyToReceive from "./ReadyToReceive";
import WaitingForSender from "./WaitingForSender";
import ReceivingFile from "./ReceivingFile";
import ReceiverTransferCompleted from "./ReceiverTransferCompleted";

export default function ReceiveFlow() {
  const isConnectedToSender = useFileReceiverStore(
    (state) => state.isConnectedToSender,
  );
  const isSenderTransferring = useFileReceiverStore(
    (state) => state.isSenderTransferring,
  );
  const isTransferCompleted = useFileReceiverStore(
    (state) => state.isTransferCompleted,
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ref, bounds] = useMeasure();

  useEffect(() => {
    function determineStep() {
      if (
        !isConnectedToSender &&
        !isSenderTransferring &&
        !isTransferCompleted
      ) {
        return 1;
      }

      if (
        isConnectedToSender &&
        !isSenderTransferring &&
        !isTransferCompleted
      ) {
        return 2;
      }

      if (isConnectedToSender && isSenderTransferring && !isTransferCompleted) {
        return 3;
      }

      if (isConnectedToSender && !isSenderTransferring && isTransferCompleted) {
        return 4;
      }

      return 0;
    }
    const newStep = determineStep();
    if (newStep !== currentStep) {
      setDirection(newStep > currentStep ? 1 : -1);
      setCurrentStep(newStep);
    }
  }, [
    isConnectedToSender,
    isSenderTransferring,
    isTransferCompleted,
    currentStep,
  ]);

  const FLOW_COMPONENTS = [
    <InitialTransitionLoader key="initialTransitionLoader" />,
    <ReadyToReceive key="receiverReadyState" />,
    <WaitingForSender key="waitingReadyState" />,
    <ReceivingFile key="receivingFile" />,
    <ReceiverTransferCompleted key="receiverTransferCompleted" />,
  ];

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
          className="w-full"
          key={index}
          ref={index === currentStep ? ref : undefined}
        >
          {component}
        </div>
      ))}
    </TransitionPanel>
  );
}
