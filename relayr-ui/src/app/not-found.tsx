"use client";

// Next.js
import Link from "next/link";

// External Libraries
import { motion } from "motion/react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";

/**
 * NotFound component displays a 404 error page when a requested page is not found.
 * It provides a message and a button to navigate back to the home page.
 *
 * @returns JSX.Element The rendered component.
 */
export default function NotFound() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center space-y-12"
      style={{ minHeight: "calc(100vh - 56px)" }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="text-center space-y-4"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          404 - Page Not Found
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Sorry, the page you are looking for does not exist.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button asChild className="p-5 font-semibold transition cursor-pointer">
          <Link href="/">Go Back Home</Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
