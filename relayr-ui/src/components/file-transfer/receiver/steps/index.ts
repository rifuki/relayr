// Step components used in the ReceiverFlow.
// Each step represents a specific stage in the file receiving process.

export { default as Step1_ReadyToReceive } from "./Step1_ReadyToReceive"; // Step 1: UI ready to start receiving
export { default as Step2_WaitForSender } from "./Step2_WaitForSender"; // Step 2: Waiting for sender to connect
export { default as Step3_Receiving } from "./Step3_Receiving"; // Step 3: File is being received
export { default as Step4_TransferCompleted } from "./Step4_TransferCompleted"; // Step 4: Transfer finished successfully
