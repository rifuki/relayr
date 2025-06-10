// External Libraries
import {
  ClockIcon,
  CloudUploadIcon,
  FileCheckIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";

// Types
import { StepConfig } from "../shared";

export const STEP_CONFIGS: StepConfig[] = [
  // Step 0
  {
    header: { title: "", description: "" },
    Icon: XIcon,
    notice: "",
    buttons: {},
  },
  // Step 1
  {
    header: {
      title: "Select File",
      description: "Choose a file to send",
    },
    Icon: XIcon,
    notice: "",
    buttons: {
      prepareDummyFile: {
        label: "Prepare Dummy File",
        key: "prepareDummyFile",
        showInDev: true,
      },
    },
  },
  // Step 2
  {
    header: {
      title: "File Selected",
      description: "Review the selected file",
    },
    Icon: XIcon,
    notice: "",
    buttons: {
      generateLink: {
        label: "Generate Link",
        key: "generateLink",
      },
      removeFile: {
        label: "Remove File",
        key: "removeFile",
        variant: "destructive",
      },
    },
  },
  // Step 3
  {
    header: {
      title: "Waiting for Receiver",
      description: "Share link and wait recipient to connect",
    },
    Icon: ClockIcon,
    notice: "Waiting for receiver to connect...",
    buttons: {
      revokeLink: {
        label: "Revoke Link",
        key: "revokeLink",
        variant: "destructive",
      },
    },
  },
  // Step 4
  {
    header: {
      title: "Ready to Transfer",
      description: "The recipient is connected. You can now start the transfer",
    },
    Icon: UploadIcon,
    notice: "",
    buttons: {
      startTransfer: { label: "Start Transfer", key: "startTransfer" },
      cancelTransfer: {
        label: "Cancel",
        key: "cancelTransfer",
        variant: "destructive",
      },
      restartTransfer: { label: "Restart", key: "restartTransfer" },
    },
  },
  // Step 5
  {
    header: {
      title: "Transfer in Progress",
      description: "The file is being sent. Please wait...",
    },
    Icon: CloudUploadIcon,
    notice: "⚠️ Transfer in progress — stay on this page",
    buttons: {
      abortTransfer: {
        label: "Abort Transfer",
        key: "abortTransfer",
        variant: "destructive",
      },
    },
  },
  // Step 6
  {
    header: {
      title: "Transfer Complete",
      description: "The file has been successfully sent",
    },
    Icon: FileCheckIcon,
    notice: "",
    buttons: {
      startNewTransfer: {
        label: "StartNew Transfer",
        key: "startNewTransfer",
      },
    },
  },
];
