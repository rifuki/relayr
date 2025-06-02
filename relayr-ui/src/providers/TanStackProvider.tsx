"use client";

// React
import { useState, ReactNode } from "react";

// External Libraries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // DevTools for React Query (commented out for production)

// Type Definitions
interface TanStackProviderProps {
  children: ReactNode;
}

export default function TanStackProvider({ children }: TanStackProviderProps) {
  // Initialize QueryClient
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 6 * 1000,
            gcTime: 0 * 60 * 1000,
            retry: 0,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* {process.env.NODE_ENV === "development" && ( */}
      {/*   <ReactQueryDevtools initialIsOpen={false} /> */}
      {/* )} */}
    </QueryClientProvider>
  );
}
