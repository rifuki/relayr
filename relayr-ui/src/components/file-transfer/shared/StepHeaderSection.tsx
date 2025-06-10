// React
import { ReactNode } from "react";

// External Libraries
import {
  AnimationProps,
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
  iconAnimation?: AnimationProps & MotionProps;
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
        className="text-center"
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
              className="flex flex-col justify-center"
              variants={motionVariants}
              {...iconAnimation}
            >
              <Icon className={cn("h-15 w-15", iconClassName)} />
            </motion.div>
          )}
      {/* Icon Section end */}
    </div>
  );
}
