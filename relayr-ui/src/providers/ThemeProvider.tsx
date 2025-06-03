"use client";

// React
import { ComponentProps } from "react";

// External Libraries
import { ThemeProvider as NextThemeProvider } from "next-themes";

/**
 * ThemeProvider Component
 *
 * This component wraps the application with the Next.js ThemeProvider to manage themes.
 * It allows for easy switching between light and dark themes.
 *
 * @param {ComponentProps<typeof NextThemeProvider>} props - The properties for the provider, including children components.
 * @returns JSX.Element The NextThemeProvider wrapping the children components.
 */
export default function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemeProvider>) {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
}
