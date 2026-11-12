import { create } from "zustand";
import type { AnalysisResponse } from "@/types/analysis";

interface AppState {
  theme: "light" | "dark";
  analysisResult: AnalysisResponse | null;
  setTheme: (theme: "light" | "dark") => void;
  setAnalysisResult: (result: AnalysisResponse | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "light",
  analysisResult: null,
  setTheme: (theme) => set({ theme }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
}));