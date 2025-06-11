"use client";
import { cn } from "@/lib/utils";
import { motion, SpringOptions, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: React.ElementType;
  decimalDigits?: number;
};

export function AnimatedNumber({
  value,
  className,
  springOptions,
  as = "span",
  decimalDigits = 2,
}: AnimatedNumberProps) {
  // Use motion(as) directly for valid React component rendering
  const MotionComponent = motion.create(as);

  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) =>
    Number(current).toFixed(decimalDigits),
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <MotionComponent className={cn("tabular-nums", className)}>
      {display}
    </MotionComponent>
  );
}
