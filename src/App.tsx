/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import { useAppStore } from './store/useAppStore';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const NormalTools = lazy(() => import('./pages/NormalTools'));
const AITools = lazy(() => import('./pages/AIUtilities'));
const Templates = lazy(() => import('./pages/TemplatesPage'));
const Signature = lazy(() => import('./pages/Signature'));
const Encryption = lazy(() => import('./pages/Encryption'));
const OrganizePdf = lazy(() => import('./pages/tools/OrganizePdf'));
const PdfFormsPage = lazy(() => import('./components/pdf-forms/PdfFormsPage'));

// Tool Pages
const MergePdfPage = lazy(() => import('./pages/tools/MergePdf'));
const SplitPdfPage = lazy(() => import('./pages/tools/SplitPdf'));
const CompressPdfPage = lazy(() => import('./pages/tools/CompressPdf'));
const CreatePdfPage = lazy(() => import('./pages/tools/CreatePdf'));
const ViewPdfPage = lazy(() => import('./pages/tools/ViewPdf'));
const EditPdfPage = lazy(() => import('./pages/tools/EditPdf'));
const OCRPage = lazy(() => import('./pages/tools/OCR'));
const SummarizePage = lazy(() => import('./pages/tools/Summarize'));
const EncryptPage = lazy(() => import('./pages/tools/Encrypt'));
const ChatPage = lazy(() => import('./pages/tools/Chat'));
const AICreatePage = lazy(() => import('./pages/tools/AICreate'));
const ComparePage = lazy(() => import('./pages/tools/Compare'));
const TranslatePage = lazy(() => import('./pages/tools/Translate'));
const NumberPdfPage = lazy(() => import('./pages/tools/NumberPdf'));

// Loading Fallback
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse text-lg">GeneralPDF...</p>
    </div>
  </div>
);

export default function App() {
  const { language, theme } = useAppStore();

  // Apply direction and theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', language);
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [language, theme]);

  return (
    <Router>
      <Toaster position="top-center" />
      <Layout>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<NormalTools />} />
            <Route path="/tools/merge" element={<MergePdfPage />} />
            <Route path="/tools/split" element={<SplitPdfPage />} />
            <Route path="/tools/compress" element={<CompressPdfPage />} />
            <Route path="/tools/create" element={<CreatePdfPage />} />
            <Route path="/tools/view" element={<ViewPdfPage />} />
            <Route path="/tools/edit" element={<EditPdfPage />} />
            <Route path="/tools/sign" element={<Signature />} />
            <Route path="/tools/encrypt" element={<EncryptPage />} />
            <Route path="/tools/number" element={<NumberPdfPage />} />
            
            <Route path="/ai-tools" element={<AITools />} />
            <Route path="/ai-tools/ocr" element={<OCRPage />} />
            <Route path="/ai-tools/summarize" element={<SummarizePage />} />
            <Route path="/ai-tools/chat" element={<ChatPage />} />
            <Route path="/ai-tools/create" element={<AICreatePage />} />
            <Route path="/ai-tools/compare" element={<ComparePage />} />
            <Route path="/ai-tools/translate" element={<TranslatePage />} />
            
            <Route path="/templates" element={<Templates />} />
            <Route path="/encryption" element={<Encryption />} />
            <Route path="/organize" element={<OrganizePdf />} />
            <Route path="/pdf-forms" element={<PdfFormsPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}
