// External Libraries
import { HTMLMotionProps, motion, Variants } from "motion/react";

// Custom Components
import { MotionButton } from "@/components/animations/motion-button";

// Tailwind CSS utility function for conditional class names
import { cn } from "@/lib/utils";

// Animation Variants
import { fileListItemVariants } from "@/lib/animations";

// Types
import { type StepButtonConfig } from "../shared";

interface StepButtonsSectionProps {
  buttons: StepButtonConfig[];
  containerClassName?: string;
  motionVariants?: Variants;
  containerMotionProps?: HTMLMotionProps<"div">;
}

export default function StepButtonsSection({
  buttons,
  containerClassName,
  motionVariants = fileListItemVariants,
  containerMotionProps,
}: StepButtonsSectionProps) {
  return (
    <motion.div
      className={cn("w-full flex flex-col items-center", containerClassName)}
      variants={motionVariants}
      {...containerMotionProps}
    >
      {buttons
        .filter(
          (btn) => !(btn.showInDev && process.env.NODE_ENV !== "development"),
        )
        .map((btn) => {
          return (
            <MotionButton
              key={btn.key}
              className={cn("w-full", btn.className)}
              variant={btn.variant}
              {...btn.buttonProps}
            >
              {btn.label}
            </MotionButton>
          );
        })}
    </motion.div>
  );
}
