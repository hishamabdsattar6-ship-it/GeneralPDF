import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import { Mail } from 'lucide-react';

export default function Footer() {
  const { language } = useAppStore();
  const t = translations[language];

  return (
    <footer className="bg-[var(--footer-bg)] border-t border-[var(--border-color)] px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] mt-auto gap-4 sm:gap-0">
      <div>© {new Date().getFullYear()} GeneralPDF - {t.title}</div>
      <div className="flex gap-6">
        <a 
          href="mailto:mhgtechnology49@gmail.com" 
          className="hover:text-[var(--primary-blue)] flex items-center gap-1 transition-colors"
        >
          <Mail className="w-4 h-4" />
          {t.contactUs}
        </a>
        <span>v1.0.0</span>
      </div>
    </footer>
  );
}
