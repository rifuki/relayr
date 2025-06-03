// External Libraries
import { motion } from "motion/react";

// Animation variants imported from shared animation config
import { fileListItemVariants } from "@/lib/animations";

// Props interface for TransferHeader component
interface TransferHeaderProps {
  title: string; // Title text to display in header
  description: string; // Description text below the title
}

/**
 * TransferHeader component renders a header section with a title and description.
 * It uses motion for animations and applies predefined animation variants.
 *
 * @param {TransferHeaderProps} props - Component props containing title and description.
 * @returns JSX.Element - A header UI element with animated text.
 */
export default function TransferHeader({
  title,
  description,
}: TransferHeaderProps) {
  return (
    <motion.div
      className="text-center space-y-2"
      variants={fileListItemVariants}
    >
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
