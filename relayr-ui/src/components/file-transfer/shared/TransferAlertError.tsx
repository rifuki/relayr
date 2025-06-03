// External Libraries
import { AlertCircleIcon } from "lucide-react";
import { motion } from "motion/react";

// ShadCN UI Components
import { Alert, AlertDescription } from "@/components/ui/alert";

// Motion Components
const MotionAlert = motion.create(Alert);
const MotionAlertCircleIcon = motion.create(AlertCircleIcon);

// Props interface for TransferAlertError component
interface AlertErrorProps {
  message: string;
}

/**
 * TransferAlertError component displays an error alert with a message.
 * It uses motion for animations and provides visual feedback for errors.
 *
 * @param {AlertErrorProps} props - Component props containing the error message.
 * @returns JSX.Element - An alert UI element with animated error message.
 */
export default function TransferAlertError({ message }: AlertErrorProps) {
  return (
    <MotionAlert
      variant="destructive"
      className="shadow-sm mb-5 p-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <AlertDescription className="flex items-center">
        <MotionAlertCircleIcon
          className="flex-shrink-0 mr-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 700,
            damping: 15,
            delay: 0.1,
          }}
        />

        <motion.p
          className="text-justify flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          {message}
        </motion.p>
      </AlertDescription>
    </MotionAlert>
  );
}
