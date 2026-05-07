import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { translations } from '../../utils/translations';
import { 
  Moon, 
  Sun, 
  Languages, 
  FileText, 
  LayoutGrid, 
  ChevronDown, 
  X,
  Home,
  FileBox,
  Brain,
  Layout,
  PenTool,
  Lock,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/cn';

export default function Header() {
  const { theme, language, toggleTheme, toggleLanguage } = useAppStore();
  const location = useLocation();
  const t = translations[language];

  const tools = [
    { to: '/', label: t.home, icon: <Home className="w-4 h-4" /> },
    { to: '/tools', label: t.normalTools, icon: <FileBox className="w-4 h-4" /> },
    { to: '/ai-tools', label: t.aiTools, icon: <Brain className="w-4 h-4" /> },
    { to: '/organize', label: t.organize, icon: <Layers className="w-4 h-4" /> },
    { to: '/pdf-forms', label: t.pdfForms, icon: <Layout className="w-4 h-4" /> },
    { to: '/templates', label: t.templates, icon: <LayoutGrid className="w-4 h-4" /> },
    { to: '/tools/sign', label: t.signature, icon: <PenTool className="w-4 h-4" /> },
    { to: '/encryption', label: t.encryption, icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 bg-[var(--header-bg)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between shadow-sm z-50 overflow-hidden">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 bg-[var(--primary-blue)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[var(--primary-blue)] hidden sm:inline-block">
            {t.title}
          </span>
        </Link>

        {/* Navigation Links with Horizontal Scroll */}
        <nav className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 flex-1 min-w-0">
          {tools.map((tool) => (
            <Link 
              key={tool.to}
              to={tool.to}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0",
                location.pathname === tool.to 
                  ? "bg-blue-50 dark:bg-blue-900/30 text-[var(--primary-blue)]" 
                  : "text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {tool.icon}
              {tool.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {/* Language Switcher */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
        >
          <Languages className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary-blue)]" />
          <span className="text-xs font-bold text-[var(--text-muted)]">
            {language === 'ar' ? 'EN' : 'عربي'}
          </span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border-color)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-[var(--text-muted)] hover:text-amber-500 dark:hover:text-amber-400 shrink-0"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
