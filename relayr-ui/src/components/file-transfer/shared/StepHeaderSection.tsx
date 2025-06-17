// React
import { ReactNode } from "react";

// External Libraries
import {
  HTMLMotionProps,
  motion,
  MotionProps,
  Variants,
} from "motion/react";

// Tailwind CSS utility function for conditional class names
import { cn } from "@/lib/utils";

// Animation Variants
import { fileListItemVariants } from "@/lib/animations";

// Types
import { type StepIconConfig } from "./";

interface StepHeaderSectionProps {
  title: string; // Title text to display in header
  description: string; // Description text below the title
  containerClassName?: string;
  iconClassName?: string;
  Icon?: StepIconConfig;
  customIcon?: ReactNode;
  iconAnimation?: MotionProps;
  motionVariants?: Variants;
  motionTitleDescProps?: HTMLMotionProps<"div">;
}

export default function StepHeaderSection({
  title,
  description,
  containerClassName,
  iconClassName,
  Icon,
  customIcon,
  iconAnimation,
  motionVariants = fileListItemVariants,
  motionTitleDescProps,
}: StepHeaderSectionProps) {
  return (
    <div
      className={cn("w-full flex flex-col items-center", containerClassName)}
    >
      {/* Header Title and Description */}
      <motion.div
        className="text-center space-y-2"
        variants={motionVariants}
        {...motionTitleDescProps}
      >
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="font-semibold text-muted-foreground">{description}</p>
      </motion.div>
      {/* Header Title and Description end */}

      {/* Icon Section */}
      {customIcon
        ? customIcon
        : Icon && (
            <motion.div
              className="w-full flex flex-col items-center mt-10 mb-5"
              variants={motionVariants}
              {...iconAnimation}
            >
              <Icon className={cn("h-17 w-17", iconClassName)} />
            </motion.div>
          )}
      {/* Icon Section end */}
    </div>
  );
}
