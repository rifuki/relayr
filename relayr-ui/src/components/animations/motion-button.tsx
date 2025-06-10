import { buttonVariants } from "../ui/button"; // pastikan ini ada, atau copy className dari Button
import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils"; // tailwind merge helper

type MotionButtonProps = HTMLMotionProps<"button"> & {
  variant?: "default" | "link" | "destructive" | "secondary";
  className?: string;
};

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  (
    {
      whileHover = { scale: 1.02 },
      whileTap = { scale: 0.98 },
      className,
      variant = "default",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        type="button"
        className={cn(
          buttonVariants({ variant }),
          "hover:cursor-pointer py-5",
          className,
        )}
        whileHover={whileHover}
        whileTap={whileTap}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

MotionButton.displayName = "MotionButton";
