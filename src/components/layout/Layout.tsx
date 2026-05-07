import { useEffect, ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import LoadingBar from './LoadingBar';
import { useAppStore } from '../../store/useAppStore';

export default function Layout({ children }: { children: ReactNode }) {
  const { theme, language } = useAppStore();

  useEffect(() => {
    const htmlElement = document.documentElement;
    
    // Apply theme
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }

    // Apply language direction
    htmlElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    htmlElement.lang = language;
  }, [theme, language]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        {children}
      </main>
      <Footer />
      <LoadingBar />
    </div>
  );
}
