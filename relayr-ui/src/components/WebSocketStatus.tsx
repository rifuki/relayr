import { getConnectionStatus } from "@/lib/utils";
import { motion } from "motion/react";

interface WebSocketStatusProps {
  readyState: number;
}

export default function WebSocketStatus({ readyState }: WebSocketStatusProps) {
  return (
    <>
      <motion.span
        className="font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Websocket status:{" "}
      </motion.span>
      <motion.span
        className="font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {getConnectionStatus(readyState)}
      </motion.span>
    </>
  );
}
