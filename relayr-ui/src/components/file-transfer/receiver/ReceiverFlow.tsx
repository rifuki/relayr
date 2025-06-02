import { useEffect, useState } from "react";

import useMeasure from "react-use-measure";

import { TransitionPanel } from "@/components/motion-primitives/transition-panel";
import InitialTransitionLoader from "@/components/motion-primitives/initial-transition-loader";
import { transitionPanelTransition } from "@/lib/animations";
import { useFileReceiverStore } from "@/stores/useFileReceiverStore";

import {
  Step1_ReadyToReceive,
  Step2_WaitingForSender,
  Step3_Receiving,
  Step4_TransferCompleted,
} from "./steps";

export default function ReceiverFlow() {
  const { isConnected } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
  const { isTransferring, isTransferCompleted } = useFileReceiverStore(
    (state) => state.transferStatus,
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ref, bounds] = useMeasure();

  useEffect(() => {
    function determineStep() {
      if (!isConnected && !isTransferring && !isTransferCompleted) {
        return 1;
      }

      if (isConnected && !isTransferring && !isTransferCompleted) {
        return 2;
      }

      if (isConnected && isTransferring && !isTransferCompleted) {
        return 3;
      }

      if (isConnected && !isTransferring && isTransferCompleted) {
        return 4;
      }

      return 0;
    }

    const newStep = determineStep();
    if (newStep !== currentStep) {
      setDirection(newStep > currentStep ? 1 : -1);
      setCurrentStep(newStep);
    }
  }, [isConnected, isTransferring, isTransferCompleted, currentStep]);

  const FLOW_COMPONENTS = [
    <InitialTransitionLoader key="step0" />,
    <Step1_ReadyToReceive key="step1" />,
    <Step2_WaitingForSender key="step2" />,
    <Step3_Receiving key="step3" />,
    <Step4_TransferCompleted key="step4" />,
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
