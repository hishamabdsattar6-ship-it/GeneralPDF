import { useAppStore } from '../../store/useAppStore';
import { Loader2 } from 'lucide-react';

export default function LoadingBar() {
  const { isLoading, loadingMessage, progress, language } = useAppStore();

  if (!isLoading) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[var(--primary-blue)] text-white px-4 sm:px-8 py-3 flex items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 animate-in slide-in-from-bottom">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2 min-w-max">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-bold">{loadingMessage}</span>
        </div>
        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden max-w-md mx-4 hidden sm:block">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress > 0 ? progress : 100}%`, animation: progress === 0 ? 'pulse 2s infinite' : 'none' }}
            ></div>
        </div>
        <span className="text-xs font-mono hidden sm:inline-block">
          {progress > 0 ? `${progress}%` : '...'}
        </span>
      </div>
      <button 
        onClick={() => useAppStore.getState().stopLoading()}
        className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
      >
        {language === 'ar' ? 'إلغاء' : 'Cancel'}
      </button>
    </div>
  );
}
