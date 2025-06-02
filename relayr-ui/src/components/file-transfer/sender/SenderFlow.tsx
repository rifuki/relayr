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
import { useFileSenderStore } from "@/stores/useFileSenderStore";

// Step Components
import {
  Step1_FileSelector,
  Step2_FileSelected,
  Step3_WaitingForRecipient,
  Step4_ReadyToSend,
  Step5_Sending,
  Step6_TransferCompleted,
} from "./steps";

/**
 * SenderFlow Component
 * This component manages the flow of file sending steps, transitioning between different states
 * based on the file selection and transfer status.
 *
 * @returns JSX.Element The rendered component.
 */
export default function SenderFlow() {
  // Retrieve file and connection/transfer status from the store
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

  // State to manage the current step in the flow and the direction of transition
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Dynamic measurement hook to get the bounds (height) of the container for smooth transitions
  const [ref, bounds] = useMeasure();

  // useEffect hook to determine the current step based on connection and transfer status
  useEffect(() => {
    // Function to determine the appropriate step based on the current status
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

    // If the new step is different from the current step, update the state and direction
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

  // Array containing the components for each step, mapped to the current step
  const FLOW_COMPONENTS = [
    <InitialTransitionLoader key="step0" />, // Initial loading state before file selection
    <Step1_FileSelector key="step1" />, // Step 1: File selection
    <Step2_FileSelected key="step2" />, // Step 2: File selected, but transfer not yet started
    <Step3_WaitingForRecipient key="step3" />, // Step 3: Waiting for recipient to connect
    <Step4_ReadyToSend key="step4" />, // Step 4: Ready to send the file
    <Step5_Sending key="step5" />, // Step 5: Sending file
    <Step6_TransferCompleted key="step6" />, // Step 6: Transfer completed
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
