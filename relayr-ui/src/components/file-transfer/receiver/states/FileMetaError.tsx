"use client";

// Next.js
import { useRouter } from "next/navigation";

// External Libraries
import { UnlinkIcon } from "lucide-react";
import { motion } from "motion/react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";

// Internal Components
import CardState from "./CardState";

// Props interface for FileMetaError component
interface FileMetaErrorProps {
  message?: string;
}

/**
 * FileMetaError component displays an error state for file metadata retrieval.
 * It shows an error icon and a message indicating the issue with the transfer link.
 *
 * @param {FileMetaErrorProps} props - The properties for the component.
 * @returns JSX.Element The rendered component.
 */
export default function FileMetaError({ message }: FileMetaErrorProps) {
  const router = useRouter();

  // Function to handle button click for retry or redirection
  const handleButtonClick = () => {
    // Reload the page to retry fetching the transfer link
    if (message === "Network Error") {
      // If the error is network-related, reload the page to retry fetching the transfer link
      window.location.reload();
    } else {
      // Otherwise, redirect the user to the 'receive' page
      router.push("/transfer/receive");
    }
  };

  return (
    <CardState>
      {/* Error icon and animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="flex items-center justify-center mb-4"
      >
        <span className="relative inline-flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 p-6 shadow-lg">
          <UnlinkIcon className="h-12 w-12 text-red-500 dark:text-red-400" />
          <span className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-full px-2 py-0.5 text-xs font-semibold text-red-500 shadow">
            !
          </span>
        </span>
      </motion.div>
      {/* Error icon and animation end */}

      {/* Error message and button */}
      <motion.div
        className="text-center space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-red-600">
          Oops! Something went wrong
        </h1>
        <p className="text-base text-muted-foreground">
          {message === "Network Error"
            ? "We couldn't connect to the sender. Please check your connection and try again."
            : "This transfer link is invalid or has expired. Please request a new link from the sender."}
        </p>

        {/* Button to retry or navigate */}
        <Button
          className="mt-2 rounded-sm bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition cursor-pointer"
          size="lg"
          onClick={handleButtonClick}
        >
          {/* Button text based on the error message */}
          {message === "Network Error" ? "Reload Page" : "Go to Receive Page"}
        </Button>

        {/* Button to retry or navigate end */}
      </motion.div>
      {/* Error message and button end */}
    </CardState>
  );
}
