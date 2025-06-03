// External Libraries
import { LinkIcon } from "lucide-react";
import { motion } from "motion/react";

// Internal Components
import CardState from "./CardState";

/**
 * MissingSenderId component displays an error state when the sender ID is missing.
 * It shows a link icon and a message indicating that the transfer link is invalid.
 *
 * @returns JSX.Element The rendered component.
 */
export default function MissingSenderId() {
  return (
    <CardState>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <LinkIcon className="h-15 w-15 text-muted-foreground" />
      </motion.div>
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h1 className="text-2xl font-bold">Invalid Link</h1>
        <p className="text-sm text-muted-foreground">
          Please ask the sender for the correct transfer link
        </p>
      </motion.div>
    </CardState>
  );
}
