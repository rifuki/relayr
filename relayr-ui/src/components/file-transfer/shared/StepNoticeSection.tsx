// External Libraries
import { motion, Variants } from "motion/react";

// Motion-Primitives UI Components
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

// Tailwind CSS Utility Function
import { cn } from "@/lib/utils";

// Animation Variants
import { fileListItemVariants } from "@/lib/animations";

interface StepNoticeSection {
  message: string;
  containerClassName?: string;
  motionVariants?: Variants;
  shimmerClassName?: string;
  shimmerDuration?: number;
}

export default function StepNoticeSection({
  message,
  containerClassName,
  motionVariants = fileListItemVariants,
  shimmerClassName,
  shimmerDuration = 3,
}: StepNoticeSection) {
  // If no message is provided, return null
  if (!message) return null;

  return (
    <motion.div
      className={cn("w-full text-center bg-amber-500", containerClassName)}
      variants={motionVariants}
    >
      {/* Display the message with shimmer effect */}
      <TextShimmer className={shimmerClassName} duration={shimmerDuration}>
        {message}
      </TextShimmer>
    </motion.div>
  );
}
