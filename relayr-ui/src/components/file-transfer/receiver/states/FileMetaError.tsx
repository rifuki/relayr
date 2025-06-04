"use client";

// Next.js
import { useRouter } from "next/navigation";

// External Libraries
import { UnlinkIcon } from "lucide-react";
import { motion } from "motion/react";

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

  const handleButtonClick = () => {
    // Reload the page to retry fetching the transfer link
    if (message === "Network Error") {
      window.location.reload();
    } else {
      router.push("/transfer/receive");
    }
  };

  return (
    <CardState>
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
      <motion.div
        className="text-center space-y-3"
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
        <button
          className="mt-2 px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition"
          onClick={handleButtonClick}
        >
          {message === "Network Error" ? "Reload Page" : "Go to Receive Page"}
        </button>
      </motion.div>
    </CardState>
  );
}
