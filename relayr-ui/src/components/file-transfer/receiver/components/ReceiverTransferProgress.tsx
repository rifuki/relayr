// External Libraries
import { motion } from "motion/react";

// ShadCN UI Components
import { Progress } from "@/components/ui/progress";

// Motion-Primitives UI Components
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { SlidingNumber } from "@/components/motion-primitives/sliding-number";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

// Constants and variants for animation durations and motion variants
import { fileListItemVariants } from "@/lib/animations";

// Utilities
import { formatFileSize } from "@/utils/file";

// State Management (Store)
import { useFileReceiverStore } from "@/stores/useFileReceiverStore";

/**
 * ReceiverTransferProgress component displays the progress of a file transfer
 * from the perspective of the receiver. It shows the amount of data received,
 * total file size, and the percentage of transfer completion.
 *
 * @returns JSX.Element - A UI element showing transfer progress with animations.
 */
export default function ReceiverTransferProgress() {
  // Retrieve total file size from store
  const { size: fileSize } = useFileReceiverStore(
    (state) => state.fileMetadata!,
  );

  // Retrieve current received bytes and transfer status flags
  const { receivedBytes, isTransferring, isTransferCompleted } =
    useFileReceiverStore((state) => state.transferStatus);

  // Retrieve receiver progress percentage
  const { receiver: receiverProgress } = useFileReceiverStore(
    (state) => state.transferProgress,
  );

  // Format the transferred value and total size label
  const { value: transferredValue, unit: transferredUnit } =
    formatFileSize(receivedBytes);
  // Format the total file size for display
  const totalSizeLabel = formatFileSize(fileSize).formatted;

  return (
    <motion.div variants={fileListItemVariants} className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        {isTransferCompleted ? (
          <TextShimmer>Transfer Completed</TextShimmer>
        ) : isTransferring ? (
          <span>
            <AnimatedNumber
              springOptions={{
                bounce: 0.25,
                duration: 100,
              }}
              value={transferredValue}
            />{" "}
            {transferredUnit} of {totalSizeLabel}
          </span>
        ) : (
          <TextShimmer>Waiting for the sender</TextShimmer>
        )}

        {/* Show receiver progress in percentage */}
        <span className="inline-flex items-center">
          <SlidingNumber value={receiverProgress} />%
        </span>
      </div>

      {/* Progress bar showing receiver's progress */}
      <Progress value={receiverProgress} />
    </motion.div>
  );
}
