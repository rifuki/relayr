// External Libraries
import { motion } from "motion/react";

// Internal Components
import CardState from "./CardState";

// Motion-Primitives UI Components
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

/**
 * FileMetaLoading component displays a loading state for file metadata retrieval.
 * It shows a loading message while fetching file information from the sender.
 *
 * @returns JSX.Element The rendered component.
 */
export default function FileMetaLoading() {
  return (
    <CardState>
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-2xl font-bold">Preparing Transfer</h1>
        <TextShimmer className="text-sm text-muted-foreground">
          Fetching file information from sender...
        </TextShimmer>
      </motion.div>
    </CardState>
  );
}
