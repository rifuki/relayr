"use client";

// External Libraries
import { toast } from "sonner";

// ShadCN UI Components
import { Button } from "@/components/ui/button";

// Utility Functions
import {
  resetReceiverLocalStorage,
  resetSenderLocalStorage,
} from "@/utils/resetLocalStorage";

/**
 * ResetLocalStoragePage Component
 * This component provides buttons to reset the localStorage for sender and receiver.
 * It uses the `resetSenderLocalStorage` and `resetReceiverLocalStorage` utility functions
 * to clear the respective localStorage entries and displays a toast notification upon completion.
 *
 * @returns JSX.Element - The rendered component with reset buttons.
 */
export default function ResetLocalStoragePage() {
  const handleResetSender = () => {
    resetSenderLocalStorage();
    toast.info("Sender localStorage has been reset.");
  };

  const handleResetReceiver = () => {
    resetReceiverLocalStorage();
    toast.info("Receiver localStorage has been reset.");
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center justify-center gap-5">
      <Button
        className="w-full cursor-pointer"
        variant="destructive"
        onClick={handleResetSender}
      >
        Reset Sender
      </Button>
      <Button
        className="w-full cursor-pointer"
        variant="destructive"
        onClick={handleResetReceiver}
      >
        Reset Receiver
      </Button>
    </div>
  );
}
