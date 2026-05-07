import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { translations } from '../utils/translations';
import FileUpload from '../components/common/FileUpload';
import { Lock, Unlock, ShieldCheck, Download, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { encryptFile, decryptFile } from '../utils/encryption';
import { saveAs } from 'file-saver';

export default function Encryption() {
  const { language, startLoading, stopLoading } = useAppStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  const handleFileUpload = (files: File[]) => {
    setFile(files[0]);
  };

  const handleProcess = async () => {
    if (!file || !password) return;

    const action = mode === 'encrypt' 
      ? (language === 'ar' ? 'جاري التشفير...' : 'Encrypting...') 
      : (language === 'ar' ? 'جاري فك التشفير...' : 'Decrypting...');
    
    startLoading(action);

    try {
      const buffer = await file.arrayBuffer();
      if (mode === 'encrypt') {
        const encrypted = await encryptFile(buffer, password);
        const blob = new Blob([encrypted], { type: 'application/octet-stream' });
        saveAs(blob, `${file.name}.enc`);
      } else {
        const decrypted = await decryptFile(buffer, password);
        const blob = new Blob([decrypted], { type: 'application/pdf' });
        saveAs(blob, file.name.replace('.enc', ''));
      }
    } catch (error) {
      console.error('Crypto Error:', error);
      alert(language === 'ar' ? 'عملية فشلت. تأكد من كلمة المرور.' : 'Operation failed. Check your password.');
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-slate-900 text-white mb-2">
          <Lock className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100 px-4">
          {language === 'ar' ? 'حماية فائقة (AES-256)' : 'Ultimate Protection (AES-256)'}
        </h1>
        <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium px-4">
          {language === 'ar' 
            ? 'تشفير عسكري للملفات. الخصوصية الكاملة حيث لا يمكن الوصول للملف بدون مفتاحك الخاص.' 
            : 'Military-grade file encryption. Total privacy where files cannot be accessed without your private key.'}
        </p>
      </div>

      <div className="flex justify-center mb-4 md:mb-8 px-4">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 w-full max-w-xs md:w-auto">
          <button 
            onClick={() => { setMode('encrypt'); setFile(null); }}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${mode === 'encrypt' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
          >
            <div className="flex items-center justify-center gap-2">
               <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" />
               {language === 'ar' ? 'تشفير' : 'Encrypt'}
            </div>
          </button>
          <button 
            onClick={() => { setMode('decrypt'); setFile(null); }}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${mode === 'decrypt' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
          >
            <div className="flex items-center justify-center gap-2">
               <Unlock className="w-3.5 h-3.5 md:w-4 md:h-4" />
               {language === 'ar' ? 'فك تشفير' : 'Decrypt'}
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start px-4">
        <div className="space-y-4 md:space-y-6">
          {!file ? (
            <FileUpload 
              onFileSelect={handleFileUpload} 
              accept={mode === 'encrypt' ? "*" : ".enc"}
              icon={mode === 'encrypt' ? <Lock className="w-8 h-8 md:w-10 md:h-10" /> : <Unlock className="w-8 h-8 md:w-10 md:h-10" />}
            />
          ) : (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 md:p-8 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex flex-col items-center text-center">
              <ShieldCheck className="w-12 h-12 md:w-16 md:h-16 text-indigo-500 mb-4" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1 text-sm md:text-base truncate max-w-full">{file.name}</h3>
              <p className="text-xs text-slate-500 mb-6">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              <button 
                onClick={() => setFile(null)}
                className="text-indigo-500 text-xs md:text-sm font-bold hover:underline"
              >
                {language === 'ar' ? 'تغيير الملف' : 'Change File'}
              </button>
            </div>
          )}

          {mode === 'encrypt' && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 md:p-4 rounded-xl flex gap-3 md:gap-4">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-amber-500 shrink-0" />
              <p className="text-[10px] md:text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                {language === 'ar' 
                  ? 'تحذير: لا يمكن استرداد الملف إذا فقدت كلمة المرور. نحن لا نخزن كلمة المرور الخاصة بك على خوادمنا.' 
                  : 'Warning: The file cannot be recovered if you lose the password. We do not store your password on our servers.'}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 lg:sticky lg:top-24">
          <h2 className="text-base md:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
            {language === 'ar' ? 'إعدادات الحماية' : 'Security Settings'}
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل كلمة مرور قوية...' : 'Enter a strong password...'}
                  className="w-full h-12 md:h-14 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-slate-900 dark:text-white text-sm md:text-base"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5 text-slate-400" /> : <Eye className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />}
                </button>
              </div>
            </div>

            <button 
              disabled={!file || !password}
              onClick={handleProcess}
              className="w-full h-12 md:h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 text-sm md:text-base"
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
              {mode === 'encrypt' 
                ? (language === 'ar' ? 'تحميل الملف المشفر' : 'Download Encrypted File')
                : (language === 'ar' ? 'تحميل الملف الأصلي' : 'Download Original File')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
