"use client";

import { ComponentProps } from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

export default function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemeProvider>) {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
}
