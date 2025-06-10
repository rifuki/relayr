// React && Next.js
import { useState } from "react";
import { useRouter } from "next/navigation";

// External Libraries
import { motion } from "motion/react";
import { InfoIcon } from "lucide-react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Internal Components
import CardState from "./CardState";

// Custom Components
import { MotionButton } from "@/components/animations/motion-button";

/**
 * MissingSenderId component allows users to enter a sender ID or a full transfer link.
 * It extracts the sender ID from the input and navigates to the receive transfer page.
 *
 * @returns JSX.Element - A form for entering sender ID or link with validation and navigation.
 */
export default function MissingSenderId() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  // Function to extract senderId from input (can be a raw senderId or a full URL)
  const extractSenderId = (value: string) => {
    try {
      // Try to parse the input value as a URL
      const url = new URL(value);
      // If it's a valid URL, get the 'id' query parameter
      return url.searchParams.get("id") || "";
    } catch {
      // Not a valid URL, treat as raw senderId
      return value.trim();
    }
  };

  // Submit handler for the form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const senderId = extractSenderId(input);

    // If senderId is empty, show an error message
    if (!senderId) {
      setError("Please enter a valid sender ID or link.");
      return;
    }

    // If senderId is valid, navigate to the receive transfer page
    router.push(`/transfer/receive?id=${encodeURIComponent(senderId)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <CardState className="w-full text-center">
        {/* Title and Information Icon */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-4 shadow-md mb-2">
            <InfoIcon className="h-8 w-8 text-neutral-800 dark:text-neutral-400" />
          </div>
          <h1 className="text-xl font-bold">Enter Sender ID</h1>
          <p className="text-muted-foreground max-w-xs">
            You need a Sender ID to receive files. Ask the sender to generate a
            link.
          </p>
        </motion.div>
        {/* Title and Information Icon End*/}

        {/* Form to submit sender ID */}
        <motion.form
          onSubmit={handleSubmit}
          className="w-full space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* Input field for entering sender ID or link */}
          <Input
            className="w-full py-5 border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition"
            placeholder="Sender ID or full link"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
          />
          {/* Input field for entering sender ID or link End */}

          {/* Display error message if any */}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {/* Display error message if any End*/}

          <div className="space-y-2">
            {/* Submit button */}
            <MotionButton
              type="submit"
              className="w-full font-semibold transition cursor-pointer"
              variant="default"
            >
              Continue
            </MotionButton>
            {/* Submit button end */}

            {/* Button to go back to the landing page*/}
            <Button
              type="button"
              className="cursor-pointer"
              variant="link"
              onClick={() => router.push("/")}
            >
              Go Home
            </Button>
            {/* Button to go back to the landing page */}
          </div>
        </motion.form>
        {/* Form to submit sender ID End */}
      </CardState>
    </motion.div>
  );
}
