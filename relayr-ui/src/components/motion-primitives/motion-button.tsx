import { Button } from "../ui/button";
import { motion } from "motion/react";
import { ComponentProps } from "react";

type MotionButtonProps = ComponentProps<typeof Button> &
  ComponentProps<typeof motion.button>;

export const MotionButton = motion.create(
  Button,
) as React.FC<MotionButtonProps>;
