// External Libraries
import { motion } from "motion/react";

// Motion-Primitives UI Components
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

// Constants and variants for animation durations and motion variants
import { ANIMATION_DURATIONS, fileListItemVariants } from "@/lib/animations";

// Utilities
import { formatFileSize } from "@/lib/utils";

// State Management (Store)
import { useFileReceiverStore } from "@/stores/useFileReceiverStore";

/**
 * ReceiverTransferProgress component displays the progress of a file transfer
 * from the receiver's perspective. It shows the amount of data received,
 * total file size, and the percentage of transfer completion.
 *
 * @returns JSX.Element - A UI element showing transfer progress with animations.
 */
export default function ReceiverTransferProgress() {
  const fileMetadata = useFileReceiverStore((state) => state.fileMetadata);

  const { receivedBytes, isTransferring, isTransferCompleted } =
    useFileReceiverStore((state) => state.transferStatus);

  const { receiver: receiverProgress } = useFileReceiverStore(
    (state) => state.transferProgress,
  );

  if (!fileMetadata) return null;

  return (
    <motion.div variants={fileListItemVariants} className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span>
          {isTransferCompleted ? (
            <TextShimmer>Transfer Completed</TextShimmer>
          ) : isTransferring ? (
            `${formatFileSize(receivedBytes)} / ${formatFileSize(fileMetadata.size)}`
          ) : (
            <TextShimmer>Waiting for the sender</TextShimmer>
          )}
        </span>
        <span>{receiverProgress}%</span>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
        {/* Background progress bar with transition */}
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${receiverProgress}%` }}
          initial={{ width: "0%" }}
          animate={{ width: `${receiverProgress}%` }}
          transition={{ duration: ANIMATION_DURATIONS.progress }}
        />

        {/* Wave effect overlay - only visible during transfer */}
        {isTransferring && (
          <div className="absolute inset-0 w-full overflow-hidden">
            <div className="wave-effect">
              <style jsx>{`
                @keyframes wave {
                  0% {
                    transform: translateX(-100%);
                  }
                  50% {
                    transform: translateX(0%);
                  }
                  100% {
                    transform: translateX(100%);
                  }
                }
                .wave-effect {
                  height: 100%;
                  width: 100%;
                  position: absolute;
                  top: 0;
                  left: 0;
                  background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.3),
                    transparent
                  );
                  animation: wave ${ANIMATION_DURATIONS.wave}s linear infinite;
                }
              `}</style>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
