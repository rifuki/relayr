// React
import { useMemo } from "react";

// External Libraries
import axios from "axios";

// Types
import type { AppError } from "@/types/api";

function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.message === "Network Error";
}

function isAppError(error: unknown): error is AppError {
  return (
    typeof error === "object" &&
    error !== null &&
    "success" in error &&
    "errors" in error &&
    (error as AppError).success === false &&
    typeof (error as AppError).errors.message === "string"
  );
}

interface ParsedErrorOptions {
  appErrorMessageOverride?: (error: AppError) => string;
}

export function useApiErrorParser(
  error: unknown,
  options?: ParsedErrorOptions,
) {
  const parsedError = useMemo(() => {
    let message = "An unexpected error occurred";
    let type: "app" | "network" | "axios" | "unknown" = "unknown";

    if (isNetworkError(error)) {
      message =
        "We couldn't connect to the server. Please check your connection and try again.";
      type = "network";
    } else if (isAppError(error)) {
      type = "app";

      const overrideMessage = options?.appErrorMessageOverride?.(error);

      if (overrideMessage) {
        message = overrideMessage;
      } else {
        message = error.errors.message;
      }
    } else if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || error.message;
      type = "axios";
    } else if (error instanceof Error) {
      message = error.message;
      type = "unknown";
    }

    return {
      message,
      type,
      isNetworkError: type === "network",
      isAppError: type === "app",
    };
  }, [error, options]);

  return parsedError;
}
