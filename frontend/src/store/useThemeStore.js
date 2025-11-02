import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("streamGen-theme") || "black",
  setTheme: (theme) => {
    localStorage.setItem("streamGen-theme", theme);
    set({ theme });
  },
}));
