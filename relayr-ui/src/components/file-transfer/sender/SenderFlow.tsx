// React
import { useEffect, useMemo, useState } from "react";

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
  Step3_WaitForReceiver,
  Step4_ReadyToSend,
  Step5_Sending,
  Step6_TransferCompleted,
} from "./steps";

// Step Configurations
import { STEP_CONFIGS } from "./";

// Define stepMap with state combinations and corresponding step values
const stepMap: { [key: string]: number } = {
  "00000": 1, // Initial state, no file selected and no transfer connection yet
  "10000": 2, // File selected, but transfer connection not established yet
  "11000": 3, // File selected, sender connection and share link available, but recipient not connected yet
  "11100": 4, // Recipient connected, ready to start transfer
  "11110": 5, // Transfer in progress
  "10001": 6, // Transfer completed
};

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
  const { recipientId } = useFileSenderStore(
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

  // Generate the stepKey based on boolean values (converted to numbers) of states
  const stepKey = useMemo(
    () =>
      [
        file,
        transferShareLink,
        recipientId,
        isTransferring,
        isTransferCompleted,
      ]
        .map(Boolean) // Converts each value to a boolean (true/false)
        .map(Number) // Converts boolean values to numbers (1 or 0)
        .join(""), // Join all the number values into a single string
    [file, transferShareLink, recipientId, isTransferring, isTransferCompleted],
  );

  // useEffect hook to determine the current step based on connection and transfer status
  useEffect(() => {
    // Retrieve the new step from stepMap, default to 0 if not found or unexpected state
    const newStep = stepMap[stepKey] || 0;
    // If the new step is different from the current step, update the state and direction
    if (newStep !== currentStep) {
      setDirection(newStep > currentStep ? 1 : -1);
      setCurrentStep(newStep);
    }
  }, [stepKey, currentStep]);

  // Array containing the components for each step, mapped to the current step
  const FLOW_COMPONENTS = [
    InitialTransitionLoader,
    Step1_FileSelector,
    Step2_FileSelected,
    Step3_WaitForReceiver,
    Step4_ReadyToSend,
    Step5_Sending,
    Step6_TransferCompleted,
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
      {FLOW_COMPONENTS.map((Component, index) => {
        const stepConfig = STEP_CONFIGS[index];

        return (
          <div
            className="w-full"
            key={index}
            ref={index === currentStep ? ref : undefined}
          >
            <Component {...stepConfig} />
          </div>
        );
      })}
    </TransitionPanel>
  );
}
