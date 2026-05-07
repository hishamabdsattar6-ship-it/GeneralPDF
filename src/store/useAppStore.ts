import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';
type Language = 'ar' | 'en';

interface AppState {
  theme: Theme;
  language: Language;
  isLoading: boolean;
  isOcrProcessing: boolean;
  loadingMessage: string;
  progress: number;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  startLoading: (message?: string) => void;
  setOcrProcessing: (processing: boolean) => void;
  setProgress: (progress: number) => void;
  stopLoading: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'ar', // Default to Arabic based on requirements
      isLoading: false,
      isOcrProcessing: false,
      loadingMessage: 'جاري المعالجة...',
      progress: 0,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      toggleLanguage: () => set((state) => ({ language: state.language === 'ar' ? 'en' : 'ar' })),
      
      startLoading: (message = 'جاري المعالجة...') => set({ isLoading: true, loadingMessage: message, progress: 0 }),
      setOcrProcessing: (processing) => set({ isOcrProcessing: processing }),
      setProgress: (progress) => set({ progress }),
      stopLoading: () => set({ isLoading: false, isOcrProcessing: false, loadingMessage: '', progress: 0 }),
    }),
    {
      name: 'general-pdf-storage',
      partialize: (state) => ({ theme: state.theme, language: state.language }), // Only persist theme and language
    }
  )
);
