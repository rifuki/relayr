// External Libraries
import { Loader2Icon } from "lucide-react";
import { motion } from "motion/react";

// Motion-Primitives UI Components
import { TextLoop } from "@/components/motion-primitives/text-loop";

// Internal Components
import CardState from "./CardState";

/**
 * FileMetaLoading component displays a loading state for file metadata retrieval.
 * It shows a loading spinner and a text loop with messages indicating the loading process.
 *
 * @returns JSX.Element The rendered component.
 */
export default function FileMetaLoading() {
  return (
    <CardState>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="flex items-center justify-center mb-4"
      >
        <span className="rounded-full bg-blue-100 p-5 shadow-lg">
          <Loader2Icon className="animate-spin h-10 w-10 text-blue-500" />
        </span>
      </motion.div>
      <motion.div
        className="text-center space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <TextLoop className="text-xl font-semibold text-blue-600">
          <span>Loading file details...</span>
          <span>Connecting to sender...</span>
          <span>Preparing your transfer...</span>
        </TextLoop>
      </motion.div>
    </CardState>
  );
}
