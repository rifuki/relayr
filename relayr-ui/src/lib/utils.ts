// Utilities for CSS class manipulation
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility Function to Combine and Merge Tailwind Classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
