// External Libraries
import { AlertCircleIcon } from "lucide-react";
import { motion } from "motion/react";

// ShadCN UI Components
import { Alert, AlertDescription } from "@/components/ui/alert";

// Tailwind CSS Utility Function
import { cn } from "@/lib/utils";

// Motion Components
const MotionAlert = motion.create(Alert);
const MotionAlertCircleIcon = motion.create(AlertCircleIcon);

// Props interface for ErrorAlert component
interface ErrorAlertProps {
  message: string;
  containerClassName?: string;
}

export default function ErrorAlert({
  message,
  containerClassName,
}: ErrorAlertProps) {
  return (
    <MotionAlert
      variant="destructive"
      className={cn("shadow-sm", containerClassName)}
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
          className="flex items-center"
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
