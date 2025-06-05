"use client";

// Next.js
import Link from "next/link";

// External Libraries
import { ArrowRightIcon, LockIcon, UserPlusIcon, ZapIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ShadCN UI Components
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div
      className="container mx-auto max-w-screen-lg flex flex-col items-center justify-center px-4 md:px-6 py-8"
      style={{ minHeight: "calc(100vh - 56px)" }}
    >
      <AnimatePresence>
        <motion.div
          className="flex flex-col items-center space-y-15 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Title and Description */}
          <motion.div
            className="space-y-7"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
            <motion.h1
              className="text-3xl font-bold tracking-tight md:text-5xl text-neutral-900 dark:text-neutral-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Relayr – Instant, Effortless File Transfer
            </motion.h1>
            <motion.p
              className="text-base sm:text-lg text-muted-foreground font-medium max-w-md mx-auto"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            >
              Share files instantly—no accounts, no hassle. Powered by Axum
              (Rust) for unmatched speed and privacy.
            </motion.p>
          </motion.div>
          {/* Title and Description End */}

          {/* Action Buttons */}
          <motion.div
            className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-center gap-5"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          >
            <Link href="/transfer/send">
              <motion.div
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 4px 24px 0 rgba(0,0,0,0.07)",
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  className="w-full sm:w-auto rounded-lg p-6 font-semibold cursor-pointer shadow-md"
                  size="lg"
                >
                  Send a File
                  <ArrowRightIcon className="ml-1" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/transfer/receive">
              <motion.div
                whileHover={{
                  scale: 1.04,
                  boxShadow: "0 4px 24px 0 rgba(0,0,0,0.07)",
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  className="w-full sm:w-auto rounded-lg p-6 font-semibold bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shadow-md"
                  size="lg"
                  variant="outline"
                >
                  Receive a File
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          {/* Action Buttons End */}

          {/* Features Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12 sm:mt-8 cursor-default"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.18,
                  delayChildren: 0.7,
                },
              },
            }}
          >
            <motion.div
              className="p-6 rounded-lg shadow-sm bg-background/60 space-y-4 hover:shadow-lg transition-shadow border border-neutral-200 dark:border-neutral-800"
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{
                y: -4,
                scale: 1.025,
                boxShadow: "0 8px 32px 0 rgba(0,0,0,0.09)",
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="w-11 h-11 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 18,
                  delay: 1.0,
                }}
              >
                <ZapIcon className="w-5 h-5 text-blue-500" />
              </motion.div>
              <div className="text-left space-y-1">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Real-Time Transfer
                </h3>
                <p className="text-sm text-muted-foreground">
                  Experience instant file transfers with WebSocket technology
                </p>
              </div>
            </motion.div>

            <motion.div
              className="p-6 rounded-lg shadow-sm bg-background/60 space-y-4 hover:shadow-lg transition-shadow border border-neutral-200 dark:border-neutral-800"
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{
                y: -4,
                scale: 1.025,
                boxShadow: "0 8px 32px 0 rgba(0,0,0,0.09)",
              }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            >
              <motion.div
                className="w-11 h-11 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 18,
                  delay: 1.1,
                }}
              >
                <LockIcon className="w-5 h-5 text-purple-500" />
              </motion.div>
              <div className="text-left space-y-1">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Secure & Private
                </h3>
                <p className="text-sm text-muted-foreground">
                  All files are end-to-end encrypted, with zero storage or
                  traces left on our servers.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="p-6 rounded-lg shadow-sm bg-background/60 space-y-4 hover:shadow-lg transition-shadow border border-neutral-200 dark:border-neutral-800"
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{
                y: -4,
                scale: 1.025,
                boxShadow: "0 8px 32px 0 rgba(0,0,0,0.09)",
              }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <motion.div
                className="w-11 h-11 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 18,
                  delay: 1.2,
                }}
              >
                <UserPlusIcon className="w-5 h-5 text-pink-500" />
              </motion.div>
              <div className="text-left space-y-1">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  No Sign Up, No Hassle
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start transferring files instantly—no account, no
                  registration, just seamless sharing.
                </p>
              </div>
            </motion.div>
          </motion.div>
          {/* Features Section */}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
