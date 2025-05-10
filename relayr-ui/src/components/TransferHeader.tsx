import { fileListItemVariants } from "@/lib/animations";
import { motion } from "motion/react";

interface TransferHeaderProps {
  title: string;
  description: string;
}
export default function TransferHeader({
  title,
  description,
}: TransferHeaderProps) {
  return (
    <motion.div
      className="text-center space-y-2"
      variants={fileListItemVariants}
    >
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
}
