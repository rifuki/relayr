import { motion } from "motion/react";

import CardState from "./CardState";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

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
