// Types
import type { Variants } from "motion/react";

// Transition Settings for the Panel
export const transitionPanelTransition = {
  x: { type: "spring" as const, stiffness: 300, damping: 30 }, // Horizontal transition
  opacity: { duration: 0.2 }, // Opacity transition duration
  height: { type: "spring" as const, stiffness: 500, damping: 50 }, // Height transition
};

// Variants for the File List Wrapper (container)
export const fileListWrapperVariants: Variants = {
  hidden: { opacity: 0 }, // Hidden state with no opacity
  show: {
    opacity: 1, // Show state with full opacity
    transition: {
      staggerChildren: 0.1, // Stagger the child elements' animations
      delayChildren: 0.3, // Delay the child elements' animations
    },
  },
};

// Variants for individual File List Items
export const fileListItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 }, // Hidden state with opacity 0 and vertical offset
  show: {
    opacity: 1, // Show state with full opacity
    y: 0, // No vertical offset
    transition: { type: "spring", stiffness: 300, damping: 30 }, // Spring animation for smooth transition
  },
};
