// Step components used in the SenderFlow.
// Each step represents a specific stage in the file sending process.

export { default as Step1_FileSelector } from "./Step1_FileSelector"; // Step 1: User selects file(s) to send
export { default as Step2_FileSelected } from "./Step2_FileSelected"; // Step 2: File(s) selected and ready for confirmation
export { default as Step3_WaitForReceiver } from "./Step3_WaitForReceiver"; // Step 3: Waiting for receiver to connect
export { default as Step4_ReadyToSend } from "./Step4_ReadyToSend"; // Step 4: Ready to initiate file transfer
export { default as Step5_Sending } from "./Step5_Sending"; // Step 5: File is being sent to recipient
export { default as Step6_TransferCompleted } from "./Step6_TransferCompleted"; // Step 6: Transfer finished successfully
