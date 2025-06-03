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
  const [debugMode, setDebugMode] = useState(true); // Toggle untuk debug

  // Dynamic measurement hook to get the bounds (height) of the container for smooth transitions
  const [ref, bounds] = useMeasure();

  // useEffect hook to determine the current step based on connection and transfer status
  useEffect(() => {
    // Debug: Log semua state values
    console.log("🔍 State Debug:", {
      file: !!file,
      transferShareLink: !!transferShareLink,
      recipientId: !!recipientId,
      isTransferring,
      isTransferCompleted,
      currentStep,
    });

    // Define stepMap with state combinations and corresponding step values
    const stepMap: { [key: string]: number } = {
      "00000": 1, // Initial state, no file selected and no transfer connection yet
      "10000": 2, // File selected, but transfer connection not established yet
      "11000": 3, // File selected, sender connection and share link available, but recipient not connected yet
      "11100": 4, // Recipient connected, ready to start transfer
      "11110": 5, // Transfer in progress
      "11101": 6, // Transfer completed (with connection still active)
      "10001": 6, // Transfer completed (connection cleaned up) - FIX untuk case pertama
      "01001": 6, // Transfer completed, file cleared but link remains
      "00001": 6, // Transfer completed, everything cleaned except status
    };

    // Generate the stateKey based on boolean values (converted to numbers) of states
    const stepKey = [
      file,
      transferShareLink,
      recipientId,
      isTransferring,
      isTransferCompleted,
    ]
      .map(Boolean) // Converts each value to a boolean (true/false)
      .map(Number) // Converts boolean values to numbers (1 or 0)
      .join(""); // Join all the number values into a single string

    // Retrieve the new step from stepMap, default to 1 if not found
    const newStep = stepMap[stepKey] || 1;

    console.log("🎯 Step Calculation:", {
      stepKey,
      newStep,
      currentStep,
      isStepChange: newStep !== currentStep,
    });

    // If the new step is different from the current step, update the state and direction
    if (newStep !== currentStep) {
      const newDirection = newStep > currentStep ? 1 : -1;
      console.log("🔄 Step Transition:", {
        from: currentStep,
        to: newStep,
        direction: newDirection,
      });

      setDirection(newDirection);
      setCurrentStep(newStep);
    }
  }, [
    file,
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

  // Debug component untuk testing Step6 secara langsung
  const TestStep6 = () => (
    <div
      style={{
        padding: "20px",
        background: "lightgreen",
        border: "2px solid green",
        margin: "10px 0",
      }}
    >
      <h2>🧪 Direct Test Step6</h2>
      <Step6_TransferCompleted />
    </div>
  );

  // Render dengan debug info
  console.log("🎨 Rendering with currentStep:", currentStep);

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "400px" }}>
      {/* Debug Panel */}
      {debugMode && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            fontSize: "12px",
            zIndex: 9999,
            fontFamily: "monospace",
          }}
        >
          <div>
            <strong>🔍 DEBUG INFO</strong>
          </div>
          <div>
            Current Step: <strong>{currentStep}</strong>
          </div>
          <div>
            Direction: <strong>{direction}</strong>
          </div>
          <div>
            File: <strong>{file ? "✅" : "❌"}</strong>
          </div>
          <div>
            Share Link: <strong>{transferShareLink ? "✅" : "❌"}</strong>
          </div>
          <div>
            Recipient: <strong>{recipientId ? "✅" : "❌"}</strong>
          </div>
          <div>
            Transferring: <strong>{isTransferring ? "✅" : "❌"}</strong>
          </div>
          <div>
            Completed: <strong>{isTransferCompleted ? "✅" : "❌"}</strong>
          </div>
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={() => setDebugMode(false)}
              style={{
                background: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              Hide Debug
            </button>
          </div>
        </div>
      )}

      {/* Debug Toggle Button */}
      {!debugMode && (
        <button
          onClick={() => setDebugMode(true)}
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            background: "blue",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "50%",
            cursor: "pointer",
            zIndex: 9999,
            fontSize: "12px",
          }}
        >
          🐛
        </button>
      )}

      {/* Test Direct Step6 - uncomment untuk testing */}
      {/* {currentStep === 6 && (
        <div style={{ marginBottom: '20px' }}>
          <TestStep6 />
        </div>
      )} */}

      {/* Main TransitionPanel */}
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
        {FLOW_COMPONENTS.map((component, index) => {
          const isActive = index === currentStep;
          console.log(
            `🎭 Component ${index} ${isActive ? "(ACTIVE)" : "(INACTIVE)"}`,
          );

          return (
            <div
              key={index}
              ref={isActive ? ref : undefined}
              className="w-full"
              style={{
                // Debug styling untuk melihat component bounds
                ...(debugMode && {
                  border: isActive
                    ? "3px solid red"
                    : "1px solid rgba(128,128,128,0.3)",
                  background: isActive
                    ? "rgba(255,0,0,0.05)"
                    : "rgba(128,128,128,0.02)",
                }),
                minHeight: "200px", // Pastikan ada tinggi minimum
                position: "relative",
              }}
            >
              {/* Debug label */}
              {debugMode && (
                <div
                  style={{
                    position: "absolute",
                    top: "5px",
                    left: "5px",
                    background: isActive ? "red" : "gray",
                    color: "white",
                    padding: "2px 8px",
                    fontSize: "10px",
                    borderRadius: "12px",
                    zIndex: 10,
                  }}
                >
                  Step {index} {isActive ? "(ACTIVE)" : ""}
                </div>
              )}

              {component}
            </div>
          );
        })}
      </TransitionPanel>

      {/* Fallback untuk step yang tidak dikenali */}
      {currentStep > FLOW_COMPONENTS.length - 1 && (
        <div
          style={{
            padding: "20px",
            background: "orange",
            color: "white",
            textAlign: "center",
            borderRadius: "8px",
          }}
        >
          ⚠️ Unknown Step: {currentStep}
        </div>
      )}

      {/* Emergency Step6 Fallback - uncomment jika TransitionPanel bermasalah */}
      {/* {currentStep === 6 && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          background: 'white',
          zIndex: 1000
        }}>
          <div style={{ padding: '20px', textAlign: 'center', background: 'lightblue' }}>
            🚨 Emergency Step6 Fallback
          </div>
          <Step6_TransferCompleted />
        </div>
      )} */}
    </div>
  );
}
