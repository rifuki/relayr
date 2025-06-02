// React
import { useEffect, useState } from "react";

// External Libraries
import useMeasure from "react-use-measure";

// Motion-Primitives UI Components
import InitialTransitionLoader from "@/components/motion-primitives/initial-transition-loader";
import { TransitionPanel } from "@/components/motion-primitives/transition-panel";

// Animations
import { transitionPanelTransition } from "@/lib/animations";

// State Management (Store)
import { useFileReceiverStore } from "@/stores/useFileReceiverStore";

// Step Components
import {
  Step1_ReadyToReceive,
  Step2_WaitingForSender,
  Step3_Receiving,
  Step4_TransferCompleted,
} from "./steps";

/**
 * ReceiverFlow Component
 * This component manages the flow of file receiving steps, transitioning between different states
 * based on the connection and transfer status.
 *
 * @returns JSX.Element The rendered component.
 */
export default function ReceiverFlow() {
  // Retrieve connection and transfer status from the store
  const { isConnected } = useFileReceiverStore(
    (state) => state.transferConnection,
  );
  const { isTransferring, isTransferCompleted } = useFileReceiverStore(
    (state) => state.transferStatus,
  );

  // State to manage the current step in the flow and the direction of transition
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Dynamic measurement hook to get the bounds (height) of the container for smooth transitions
  const [ref, bounds] = useMeasure();

  // useEffect hook to determine the current step based on connection and transfer status
  useEffect(() => {
    // Function to determine the appropriate step based on the current status
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

      // Default fallback: unexpected state
      return 0;
    }

    const newStep = determineStep();

    // If the new step is different from the current step, update the state and direction
    if (newStep !== currentStep) {
      setDirection(newStep > currentStep ? 1 : -1);
      setCurrentStep(newStep);
    }
  }, [isConnected, isTransferring, isTransferCompleted, currentStep]);

  // Array containing the components for each step, mapped to the current step
  const FLOW_COMPONENTS = [
    <InitialTransitionLoader key="step0" />,
    <Step1_ReadyToReceive key="step1" />,
    <Step2_WaitingForSender key="step2" />,
    <Step3_Receiving key="step3" />,
    <Step4_TransferCompleted key="step4" />,
  ];

  return (
    // TransitionPanel component to manage transitions between steps
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
