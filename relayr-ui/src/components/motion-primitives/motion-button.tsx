import { Button } from "../ui/button";
import { motion } from "motion/react";
import { ComponentProps, forwardRef } from "react";

type MotionButtonProps = ComponentProps<typeof Button> &
  ComponentProps<typeof motion.button>;

const MotionButtonBase = motion.create(Button);

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  (
    {
      whileHover = { scale: 1.02 },
      whileTap = { scale: 0.98 },
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <MotionButtonBase
        ref={ref}
        className={`hover:cursor-pointer ${className || ""}`}
        whileHover={whileHover}
        whileTap={whileTap}
        {...props}
      />
    );
  },
);

MotionButton.displayName = "MotionButton";
