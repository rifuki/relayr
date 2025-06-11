// React
import { ReactNode } from "react";

// External Libraries
import { motion, Variants } from "motion/react";

// Motion-Primitives UI Components
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { SlidingNumber } from "@/components/motion-primitives/sliding-number";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

// ShadCN UI Components
import { Progress } from "@/components/ui/progress";

// Tailwind CSS Utility Function
import { cn } from "@/lib/utils";

// Utility Functions
import { formatFileSize } from "@/utils/file";

// Animation Variants
import { fileListItemVariants } from "@/lib/animations";

interface StepTransferProgressSectionProps {
  progress: number;
  transferredBytes: number;
  totalSize: number;
  isTransferring: boolean;
  isTransferError: boolean;
  isTransferCompleted: boolean;
  idleText?: string;
  containerClassName?: string;
  textShimmerDuration?: number;
  motionVariants?: Variants;
}

export default function StepTransferProgressSection({
  progress,
  transferredBytes,
  totalSize,
  isTransferring,
  isTransferError,
  isTransferCompleted,
  idleText,
  containerClassName,
  textShimmerDuration = 2,
  motionVariants = fileListItemVariants,
}: StepTransferProgressSectionProps) {
  // Format the transferred value and total size label
  const { value: transferredValue, unit: transferredUnit } =
    formatFileSize(transferredBytes);
  // Format the total file size for display
  const totalSizeLabel = formatFileSize(totalSize).formatted;

  // Determine the number of decimal digits based on the transferred unit
  let decimalDigits = 2;
  if (transferredUnit === "KB" || transferredUnit === "Bytes")
    decimalDigits = 0;

  // If the transferred value is NaN, default it to 0
  const safeTransferredValue = isNaN(transferredValue) ? 0 : transferredValue;

  // Determine the content to display based on transfer status
  let statusContent: ReactNode;
  if (isTransferCompleted) {
    // If transfer is completed, show a success message with shimmer effect
    statusContent = (
      <TextShimmer duration={textShimmerDuration}>
        Transfer Completed
      </TextShimmer>
    );
  } else if (isTransferError) {
    // If there was an error during transfer, show an error message
    statusContent = (
      <span className="text-destructive">Error during transfer</span>
    );
  } else if (isTransferring) {
    // If transfer is in progress, show the transferred value and total size
    statusContent = (
      <span>
        <AnimatedNumber
          springOptions={{
            bounce: 0.25,
            duration: 100,
          }}
          value={safeTransferredValue}
          decimalDigits={decimalDigits}
        />{" "}
        {transferredUnit} of {totalSizeLabel}
      </span>
    );
  } else if (idleText) {
    // If transfer is idle and idleText is provided, show it with shimmer effect
    statusContent = (
      <TextShimmer duration={textShimmerDuration}>{idleText}</TextShimmer>
    );
  } else {
    // If no transfer is in progress and no idleText, show a default unexpected error message
    statusContent = (
      <span className="text-destructive">Unexpected error occurred</span>
    );
  }

  return (
    <motion.div
      className={cn(
        "w-full flex flex-col items-center gap-1",
        containerClassName,
      )}
      variants={motionVariants}
    >
      <div className="w-full flex justify-between text-sm">
        {/* Display the current transfer status */}
        {statusContent}

        {/* Show receiver progress in percentage */}
        <span className="inline-flex items-center">
          <SlidingNumber value={progress} />%
        </span>
      </div>

      {/* Progress bar showing receiver's progress */}
      <Progress value={progress} className="h-3 rounded-sm" />
    </motion.div>
  );
}
