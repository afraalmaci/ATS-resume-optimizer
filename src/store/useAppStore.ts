import { create } from "zustand";

interface AppState {
  theme: "light" | "dark";
  analysisResult: any;
  setTheme: (theme: "light" | "dark") => void;
  setAnalysisResult: (result: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "light",
  analysisResult: null,
  setTheme: (theme) => set({ theme }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
}));