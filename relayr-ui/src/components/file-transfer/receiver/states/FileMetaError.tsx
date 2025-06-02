// External Libraries
import { FileXIcon } from "lucide-react";
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
  return (
    <CardState>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <FileXIcon className="h-15 w-15 text-destructive" />
      </motion.div>
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-bold">Transfer Link Error</h2>
        <p className="text-sm text-muted-foreground">
          {message ?? "Please ask the sender for the correct transfer link"}
        </p>
      </motion.div>
    </CardState>
  );
}
