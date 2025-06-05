"use client";

// React
import { useState, FormEvent, useEffect } from "react";

// External Libraries
import { toast } from "sonner";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Utility Functions
import {
  resetReceiverLocalStorage,
  resetSenderLocalStorage,
} from "@/utils/local-storage";

/**
 * ResetLocalStoragePage Component
 * This component provides buttons to reset the localStorage for sender and receiver.
 * It uses the `resetSenderLocalStorage` and `resetReceiverLocalStorage` utility functions
 * to clear the respective localStorage entries and displays a toast notification upon completion.
 *
 * @returns JSX.Element - The rendered component with reset buttons.
 */
export default function ResetLocalStoragePage() {
  const [sender, setSender] = useState<string | null>(null);
  const [receiver, setReceiver] = useState<string | null>(null);
  const [inputSender, setInputSender] = useState("");
  const [inputReceiver, setInputReceiver] = useState("");

  const handleSubmitSender = (e: FormEvent) => {
    e.preventDefault();
    if (!inputSender) {
      toast.error("Sender cannot be empty.");
      return;
    }
    localStorage.setItem("sender", inputSender);
    setSender(inputSender);
    toast.success("Sender has been set.");
  };

  const handleSubmitReceiver = (e: FormEvent) => {
    e.preventDefault();
    if (!inputReceiver) {
      toast.error("Receiver cannot be empty.");
      return;
    }
    localStorage.setItem("receiver", inputReceiver);
    setReceiver(inputReceiver);
    toast.success("Receiver has been set.");
  };

  const handleResetSender = () => {
    resetSenderLocalStorage();
    setSender(null);
    toast.info("Sender localStorage has been reset.");
  };

  const handleResetReceiver = () => {
    resetReceiverLocalStorage();
    setReceiver(null);
    toast.info("Receiver localStorage has been reset.");
  };

  useEffect(() => {
    // Load initial sender from localStorage
    const storedSender = localStorage.getItem("sender");
    if (storedSender) {
      setSender(storedSender);
    }
    // Load initial receiver from local-storage
    const storedReceiver = localStorage.getItem("receiver");
    if (storedReceiver) {
      setReceiver(storedReceiver);
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-5 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Local Storage</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>
            Sender: <span className="font-bold">{sender ?? "Not set"}</span>
          </p>
          <p>
            Receiver: <span className="font-bold">{receiver ?? "Not set"}</span>
          </p>
        </CardContent>
      </Card>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Modify Local Storage</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form onSubmit={handleSubmitSender} className="space-y-2">
            <Input
              onChange={(e) => setInputSender(e.target.value)}
              placeholder="Sender"
            />
            <Button
              className="w-full cursor-pointer"
              onClick={handleSubmitSender}
            >
              Save
            </Button>
          </form>

          <form onSubmit={handleSubmitSender} className="space-y-2">
            <Input
              onChange={(e) => setInputReceiver(e.target.value)}
              placeholder="Receiver"
            />
            <Button
              className="w-full cursor-pointer"
              onClick={handleSubmitReceiver}
            >
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Reset Local Storage</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            className="w-full cursor-pointer"
            variant="destructive"
            onClick={handleResetSender}
          >
            Sender
          </Button>
          <Button
            className="w-full cursor-pointer"
            variant="destructive"
            onClick={handleResetReceiver}
          >
            Receiver
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
