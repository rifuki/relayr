"use client";

// React
import { useEffect, useState } from "react";

// External Libraries
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

// ShadCN UI Components
import { Button } from "./ui/button";

/**
 * ThemeToggle component allows users to switch between light and dark themes.
 * It uses the `useTheme` hook from `next-themes` to manage the theme state.
 * It displays a sun icon for light mode and a moon icon for dark mode,
 * with smooth transitions between the two icons.
 *
 * @returns JSX.Element The ThemeToggle component.
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      className="rounded-full hover:bg-primary/10 cursor-pointer"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
