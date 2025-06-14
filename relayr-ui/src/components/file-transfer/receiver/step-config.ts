// Types
import {
  ClockIcon,
  CloudDownloadIcon,
  FileCheckIcon,
  UnplugIcon,
  XIcon,
} from "lucide-react";
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
      title: "Ready to Receive",
      description: "Connect to the server to begin the file transfer",
    },
    Icon: UnplugIcon,
    notice: "",
    buttons: {
      connectToSender: {
        label: "Connect to Sender",
        key: "connectToSender",
      },
    },
  },
  // Step 2
  {
    header: {
      title: "Awaiting Sender",
      description:
        "Stand by while the sender connects and prepares the transfer",
    },
    Icon: ClockIcon,
    notice: "⚠️ Waiting for sender — stay on this page",
    buttons: {
      cancelRecipientReady: {
        label: "Cancel",
        key: "cancelRecipientReady",
        variant: "destructive",
      },
    },
  },
  // Step 3
  {
    header: {
      title: "Receiving File",
      description: "Transfer in progress. Please wait until it completes",
    },
    Icon: CloudDownloadIcon,
    notice: "⚠️ Transfer in progress — stay on this page",
    buttons: {
      abortTransfer: {
        label: "Abort Transfer",
        key: "abortTransfer",
        variant: "destructive",
      },
    },
  },
  // Step 4
  {
    header: {
      title: "Transfer Complete",
      description: "The file has been received sucessfully",
    },
    Icon: FileCheckIcon,
    notice: "",
    buttons: {
      downloadFile: {
        label: "Download",
        key: "downloadFile",
      },
      receiveAnotherFile: {
        label: "Receive Another File",
        key: "receiveAnotherFile",
        variant: "link",
      },
    },
  },
];
