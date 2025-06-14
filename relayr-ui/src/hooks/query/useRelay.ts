"use client";

// External Libraries
import { useQuery } from "@tanstack/react-query";

// Api Services
import { relayService } from "@/lib/api";

/**
 * Custom hook to fetch file metadata for a given senderId
 *
 * @param senderId - The ID of the sender to fetch file metadata for.
 * @returns - The result of the React Query useQuery hook for fetching file metadata.
 */
export function useRelayFileMetadata(
  senderId: string,
  options?: { enabled: boolean },
) {
  return useQuery({
    queryKey: ["relayFileMetadata", senderId], // Unique query key for caching
    queryFn: () => relayService.getFileMetadata(senderId), // Function to fetch file metadata
    enabled: !!senderId && (options?.enabled ?? true), // Query is enabled only if senderId exists
  });
}
export function useRelayPing(options?: {
  enabled?: boolean;
  intervalMs?: number;
}) {
  return useQuery({
    queryKey: ["relayPing"], // Unique query key for caching
    queryFn: () => relayService.ping(),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.intervalMs ?? false,
  });
}
