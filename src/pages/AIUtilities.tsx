import { useAppStore } from '../store/useAppStore';
import { Brain, Languages, MessageSquare, Files, Sparkles, Scan, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const aiToolsList = [
  { id: 'summarize', path: '/ai-tools/summarize', icon: Brain, title: 'التلخيص الذكي', desc: 'لخص أي ملف PDF في ثوانٍ', titleEn: 'Smart Summarize', descEn: 'Summarize any PDF in seconds', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
  { id: 'ocr', path: '/ai-tools/ocr', icon: Scan, title: 'استخراج النصوص OCR', desc: 'حول الصور إلى نصوص قابلة للتعديل', titleEn: 'OCR Extraction', descEn: 'Convert images to editable text', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
  { id: 'chat', path: '/ai-tools/chat', icon: MessageSquare, title: 'تحدث إلى ملفك', desc: 'اسأل الذكاء الاصطناعي عن محتوى الملف', titleEn: 'Chat with PDF', descEn: 'Ask AI about file content', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
  { id: 'translate', path: '/ai-tools/translate', icon: Languages, title: 'ترجمة الملفات', desc: 'ترجم ملفك إلى لغات أخرى بذكاء', titleEn: 'AI Translator', descEn: 'Translate your PDF smartly', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/30' },
  { id: 'compare', path: '/ai-tools/compare', icon: Files, title: 'مقارنة الملفات', desc: 'قارن بين ملفين واكتشف الفروق', titleEn: 'Compare PDFs', descEn: 'Compare two files and find diffs', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  { id: 'create', path: '/ai-tools/create', icon: Sparkles, title: 'إنشاء بالذكاء الاصطناعي', desc: 'أنشئ ملفك من مجرد وصف بسيط', titleEn: 'AI Generation', descEn: 'Create file from simple description', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  { id: 'encrypt', path: '/tools/encrypt', icon: Lock, title: 'تشفير AES-256-GCM', desc: 'حماية فائقة لا يمكن اختراقها', titleEn: 'Secure Encryption', descEn: 'Unbreakable AES-256 protection', color: 'text-slate-700', bg: 'bg-slate-100 dark:bg-slate-800' },
];

export default function AITools() {
  const { language } = useAppStore();
  const isAr = language === 'ar';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {isAr ? 'أدوات الذكاء الاصطناعي' : 'AI Powered Tools'}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          {isAr 
            ? 'مجموعة من الأدوات المتقدمة التي تعيد تعريف كيفية تعاملك مع مستندات الـ PDF.' 
            : 'Advanced tools redefining how you interact with PDF documents.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiToolsList.map((tool) => (
          <Link 
            key={tool.id} 
            to={tool.path}
            className="group relative bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-14 h-14 rounded-2xl ${tool.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <tool.icon className={`w-7 h-7 ${tool.color}`} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {isAr ? tool.title : tool.titleEn}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr ? tool.desc : tool.descEn}
            </p>
            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className={`w-8 h-8 rounded-full ${tool.bg} flex items-center justify-center`}>
                 <Sparkles className={`w-4 h-4 ${tool.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
