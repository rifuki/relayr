import { motion } from "motion/react";

interface WebSocketStatusProps {
  readyState: number;
}

export default function TransferConnectionStatus({ readyState }: WebSocketStatusProps) {
  let statusText = "";
  let statusColor = "";

  switch (readyState) {
    case 0:
      statusText = "Connecting...";
      statusColor = "text-yellow-500";
      break;
    case 1:
      statusText = "Connected";
      statusColor = "text-green-500";
      break;
    case 2:
      statusText = "Closing...";
      statusColor = "text-orange-500";
      break;
    case 3:
      statusText = "Disconnected";
      statusColor = "text-red-500";
      break;
    default:
      statusText = "Unknown";
      statusColor = "text-gray-500";
      break;
  }

  return (
    <>
      <motion.span
        className={`font-medium ${statusColor}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Websocket status:{" "}
      </motion.span>
      <motion.span
        className={`font-bold ${statusColor}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {statusText}
      </motion.span>
    </>
  );
}
