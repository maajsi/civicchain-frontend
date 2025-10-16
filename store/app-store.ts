import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  user_id: string;
  email: string;
  name: string;
  profile_pic: string;
  wallet_address: string;
  role: string;
  rep: number;
}

interface AppState {
  user: User | null;
  location: { lat: number; lng: number } | null;
  filters: {
    category: string[];
    status: string[];
    radius: number;
  };
  setUser: (user: User | null) => void;
  setLocation: (location: { lat: number; lng: number }) => void;
  updateFilters: (filters: Partial<AppState["filters"]>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      location: null,
      filters: {
        category: [],
        status: ["open", "in_progress"],
        radius: 5000,
      },
      setUser: (user) => set({ user }),
      setLocation: (location) => set({ location }),
      updateFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
    }),
    {
      name: "civicchain-storage",
    }
  )
);
