// React
import { ReactNode } from "react";

// External Libraries
import { motion, Variants } from "motion/react";

// Tailwind CSS Utility Function
import { cn } from "@/lib/utils";

// Animation Variants
import { fileListWrapperVariants } from "@/lib/animations";

interface StepSectionWrapperProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  initial?: string;
  animate?: string;
}

export default function StepSectionWrapper({
  children,
  className,
  variants = fileListWrapperVariants,
  initial = "hidden",
  animate = "show",
}: StepSectionWrapperProps) {
  return (
    <motion.div
      className={cn("flex flex-col items-center", className)}
      variants={variants}
      initial={initial}
      animate={animate}
    >
      {children}
    </motion.div>
  );
}
