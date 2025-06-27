"use client";

// Next.js
import { useRouter } from "next/navigation";

// External Libraries
import { ArrowLeftIcon, UnlinkIcon } from "lucide-react";
import { motion } from "motion/react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";

// Internal Components
import CardState from "./CardState";
import { MotionButton } from "@/components/animations/motion-button";
import { useApiErrorParser } from "@/hooks/useApiErrorParser";

interface FileMetaErrorProps {
  error: unknown;
}

export default function FileMetaError({ error }: FileMetaErrorProps) {
  const router = useRouter();

  const { message, isNetworkError } = useApiErrorParser(error, {
    appErrorMessageOverride: (error) => {
      if (
        error.errors.message.toLowerCase().includes("file metadata not found")
      )
        return "Invalid or expired link. Please ask the sender for a new one.";
      else return error.errors.message;
    },
  });

  // Function to handle button click for retry or redirection
  const handleButtonClick = () => {
    // Reload the page to retry fetching the transfer link
    if (isNetworkError) {
      // If the error is network-related, reload the page to retry fetching the transfer link
      window.location.reload();
    } else {
      // Otherwise, redirect the user to the 'receive' page
      router.push("/transfer/receive");
    }
  };

  return (
    <CardState className="text-center">
      {/* Error icon and animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="flex items-center justify-center mb-4"
      >
        <span className="inline-flex items-center justify-center rounded-full bg-destructive/10 p-6 shadow-lg">
          <UnlinkIcon className="h-8 w-8 text-destructive" />
        </span>
      </motion.div>
      {/* Error icon and animation end */}

      {/* Error message and button */}
      <motion.div
        className="space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-destructive">
          Oops! Something went wrong
        </h1>
        {/* Display the error message */}
        <p className="text-base text-muted-foreground">{message}</p>

        <motion.div
          className="flex items-center justify-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {/* Button to retry or navigate */}
          <MotionButton
            className="mt-2 rounded-sm text-white font-semibold cursor-pointer"
            variant="destructive"
            onClick={handleButtonClick}
          >
            {/* Button text based on the error message */}
            {isNetworkError ? (
              "Reload Page"
            ) : (
              <span className="inline-flex items-center justify-center gap-3">
                <ArrowLeftIcon />
                Back
              </span>
            )}
          </MotionButton>
          {/* Button to retry or navigate end */}

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
        </motion.div>
      </motion.div>
      {/* Error message and button end */}
    </CardState>
  );
}
