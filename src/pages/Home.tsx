import { useAppStore } from '../store/useAppStore';
import { translations } from '../utils/translations';
import { Link } from 'react-router-dom';
import { Layers, Bot, Lock, ArrowLeftCircle, ChevronLeft } from 'lucide-react';

export default function Home() {
  const { language, startLoading, stopLoading } = useAppStore();
  const t = translations[language];

  // Dummy test action for loading bar
  const handleTestLoading = () => {
    startLoading(language === 'ar' ? 'جاري اختبار شريط التحميل...' : 'Testing loading bar...');
    setTimeout(() => stopLoading(), 3000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 relative">
      <div className="md:col-span-12 mb-2 md:mb-4 text-center md:text-right">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--primary-blue)] mb-2">
          {language === 'ar' ? 'مركز المعالجة المتكامل' : 'Integrated Processing Center'}
        </h1>
        <p className="text-[var(--text-muted)] text-sm sm:text-base md:text-lg">
          {language === 'ar' 
            ? 'حلول احترافية لتحرير وحماية ملفات PDF مدعومة بالذكاء الاصطناعي.' 
            : 'Professional solutions for editing and protecting PDF files powered by AI.'}
        </p>
      </div>

      <Link to="/tools" className="md:col-span-4 bg-[var(--header-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-[var(--primary-blue)] mb-4 group-hover:bg-[var(--primary-blue)] group-hover:text-white transition-all">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-2">{language === 'ar' ? 'دمج وتقسيم الملفات' : 'Merge and Split Files'}</h3>
        <p className="text-[var(--text-muted)] text-sm leading-relaxed">
          {language === 'ar' 
            ? 'دمج عدة مستندات في ملف واحد أو تقسيم ملف PDF كبير إلى صفحات منفصلة.' 
            : 'Merge multiple documents into a single file or split a large PDF into separate pages.'}
        </p>
      </Link>

      <Link to="/ai-tools" className="md:col-span-4 bg-[var(--header-bg)] p-6 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-md ring-2 ring-blue-500/10 cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 bg-[var(--primary-blue)] rounded-xl flex items-center justify-center text-white shadow-inner">
            <Bot className="w-6 h-6" />
          </div>
          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            AI Powered
          </span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-2">{language === 'ar' ? 'الدردشة والتلخيص' : 'Chat and Summarize'}</h3>
        <p className="text-[var(--text-muted)] text-sm leading-relaxed">
          {language === 'ar' 
            ? 'استخدم ذكاء الذكاء الاصطناعي لتحليل ملفاتك، طرح الأسئلة، واستخراج الخلاصات فورياً.' 
            : 'Use AI intelligence to analyze your files, ask questions, and extract summaries instantly.'}
        </p>
      </Link>

      <Link to="/encryption" className="md:col-span-4 bg-[var(--header-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-[var(--primary-blue)] mb-4 group-hover:bg-[var(--primary-blue)] group-hover:text-white transition-all">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-2">{language === 'ar' ? 'التشفير العسكري' : 'Military-grade Encryption'}</h3>
        <p className="text-[var(--text-muted)] text-sm leading-relaxed">
          {language === 'ar' 
            ? 'حماية الملفات بتقنية AES-256-GCM الحقيقية بعيداً عن كلمات المرور القياسية الضعيفة.' 
            : 'Protect files with real AES-256-GCM technology, far from weak standard passwords.'}
        </p>
      </Link>

      <div className="md:col-span-8 bg-[var(--primary-blue)] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-2xl">
        <div className="relative z-10 w-full text-center md:text-right">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3">
            {language === 'ar' ? 'جاهز لمعالجة ملفاتك؟' : 'Ready to process your files?'}
          </h2>
          <p className="text-blue-100 max-w-md mb-6 mx-auto md:mx-0">
            {language === 'ar' 
              ? 'قم بسحب وإفلات أي ملف هنا للبدء في استخدام أدواتنا الذكية. جميع العمليات تتم في المتصفح لضمان خصوصيتك.' 
              : 'Drag and drop any file here to start using our smart tools. All processing happens in your browser to ensure privacy.'}
          </p>
          <button 
            onClick={handleTestLoading}
            className="w-full sm:w-auto px-8 py-3 bg-white text-[var(--primary-blue)] font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {language === 'ar' ? 'ارفع الملفات الآن' : 'Upload Files Now'}
            <ArrowLeftCircle className="w-5 h-5 rtl:hidden" />
            <ChevronLeft className="w-5 h-5 ltr:hidden" />
          </button>
        </div>
        <div className="hidden md:block opacity-10 absolute left-[-20px] top-[-20px] scale-150 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.5,-0.9C86.9,14.6,81.1,29.1,72.4,41.4C63.6,53.8,51.8,63.9,38.5,71.1C25.2,78.3,10.3,82.5,-3.8,89.1C-17.9,95.7,-31.2,104.7,-42.6,101.9C-54,99.1,-63.5,84.5,-71,70.8C-78.5,57.1,-84.1,44.4,-88.1,31C-92.1,17.6,-94.5,3.6,-92,-9.5C-89.4,-22.6,-82,-34.7,-72.1,-44.6C-62.2,-54.5,-49.8,-62.1,-37.2,-70.3C-24.6,-78.5,-11.7,-87.3,1.9,-90.6C15.6,-93.9,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>
      
      <div className="md:col-span-4 flex flex-row md:flex-col gap-4">
        <div className="flex-1 bg-[var(--header-bg)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-[var(--primary-blue)]">+15</div>
          <div className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
            {language === 'ar' ? 'أداة احترافية' : 'Pro Tools'}
          </div>
        </div>
        <div className="flex-1 bg-[var(--header-bg)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-sm">
          <div className="text-2xl sm:text-3xl font-black text-[var(--primary-blue)]">100%</div>
          <div className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">
            {language === 'ar' ? 'آمن ومحلي' : 'Secure & Local'}
          </div>
        </div>
      </div>
    </div>
  );
}
