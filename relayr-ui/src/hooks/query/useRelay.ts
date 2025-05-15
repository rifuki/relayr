"use client";

import { useQuery } from "@tanstack/react-query";
import { relayService } from "@/lib/api";

export function useRelayFileMetadata(senderId: string) {
  return useQuery({
    queryKey: ["fileMetadata", senderId],
    queryFn: () => relayService.getFileMetadata(senderId),
    enabled: !!senderId,
  });
}
