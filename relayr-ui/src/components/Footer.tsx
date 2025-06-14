"use client";

// Next.js
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Footer component for the Relayr application.
 * This component is only rendered on the landing page ("/").
 * It includes the app name, copyright notice, technology stack,
 * and a link to the GitHub repository.
 *
 * @returns JSX.Element|null The footer element or null if not on the landing page.
 */
export default function Footer() {
  const pathname = usePathname();

  // Only render footer on the landing page
  if (pathname !== "/") return null;

  return (
    <footer className="w-full border-t bg-background/60 backdrop-blur-md py-4 mt-12">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-4 max-w-screen-xl">
        {/* Left side: App name and copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-muted-foreground">
          <span className="font-semibold text-primary">Relayr</span>
          <span className="hidden sm:inline mx-2">|</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        {/* Left side: App name and copyright end */}

        {/* Right side: Technology stack and GitHub link */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-sm">
          <span>
            Fast file sharing built with{" "}
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              Rust
            </span>
            {" & "}
            <span className="font-semibold text-purple-700 dark:text-purple-400">
              Axum
            </span>
          </span>
          {/* Vertical separator (only shown on larger screens) */}
          <span aria-hidden="true" className="hidden sm:inline">
            |
          </span>
          {/* GitHub repository link */}
          <Link
            href="https://github.com/rifuki/relayr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline font-medium transition-colors text-blue-600 dark:text-blue-400"
          >
            relayr on GitHub
          </Link>
        </div>
        {/* Right side: Technology stack and GitHub link */}
      </div>
    </footer>
  );
}
