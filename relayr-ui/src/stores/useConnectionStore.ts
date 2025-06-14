import { create } from "zustand";

type ConnectionState = {
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  isOnline: true,
  setIsOnline: (isOnline) => set({ isOnline }),
}));
