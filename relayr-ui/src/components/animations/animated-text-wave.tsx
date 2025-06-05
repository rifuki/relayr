"use client";

// React
import { useEffect, useState } from "react";

// External Libraries
import { motion } from "motion/react";

// Props interface for AnimatedTextWave component
interface AnimatedTextWaveProps {
  text: string;
  className?: string;
  duration?: number; // total duration for one wave cycle (in seconds)
}

export function AnimatedTextWave({
  text,
  className,
  duration = 1.2,
}: AnimatedTextWaveProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setActive((prev) => (prev + 1) % text.length);
      },
      (duration * 1000) / text.length,
    );
    return () => clearInterval(interval);
  }, [text.length, duration]);

  return (
    <span className={className} style={{ display: "inline-block" }}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          animate={i === active ? { y: -8 } : { y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          style={{ display: "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
