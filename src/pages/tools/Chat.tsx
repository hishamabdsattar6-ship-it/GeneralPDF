import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useChatStore } from '../../store/chatStore';
import FileUpload from '../../components/common/FileUpload';
import { MessageSquare, Send, Bot, User, Trash2, FileSearch, Sparkles, Clock } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { detectAndProcessPdf, PageContent } from '../../utils/pdfProcessor';
import { generateFileHash } from '../../utils/cache';

export default function Chat() {
  const { language, startLoading, stopLoading, isOcrProcessing } = useAppStore();
  const { 
    currentFileHash, 
    activeChatHistory, 
    activeExtractedText, 
    setActiveChat, 
    addMessageToActive, 
    clearActive, 
    historyEntries, 
    loadHistoryEntries, 
    saveChat 
  } = useChatStore();

  const [inputText, setInputText] = useState('');
  const [pdfPages, setPdfPages] = useState<PageContent[]>([]);
  const [pdfName, setPdfName] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistoryEntries();
  }, [loadHistoryEntries]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [activeChatHistory]);

  const pdfContext = activeExtractedText || pdfPages.map(p => p.text).join('\n');

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setPdfName(file.name);

    startLoading(language === 'ar' ? 'جاري تحليل الملف...' : 'Analyzing file...');
    
    try {
      const fileHash = await generateFileHash(file);
      
      // Check if we already have this chat
      const existingEntry = historyEntries.find(e => e.fileHash === fileHash);
      if (existingEntry) {
        await setActiveChat(fileHash);
        setPdfName(existingEntry.fileName);
        stopLoading();
        return;
      }

      const contents = await detectAndProcessPdf(file);
      setPdfPages(contents);
      const text = contents.map(p => p.text).join('\n');
      
      const hasImages = contents.some(p => p.isImageBased);
      
      const initialMessage = {
        role: 'ai' as const,
        content: language === 'ar' 
          ? `أهلاً بك! لقد تم تحليل ملف "${file.name}". ${hasImages ? 'تم استخدام تقنية OCR لبعض الصفحات المصورة.' : ''} يمكنك الآن سؤالي عن محتواه.` 
          : `Hello! I've analyzed "${file.name}". ${hasImages ? 'OCR was used for some image-based pages.' : ''} You can now ask me anything about its content.`
      };

      await saveChat({
        fileHash,
        fileName: file.name,
        extractedText: text,
        chatHistory: [initialMessage],
        timestamp: Date.now()
      });

      await setActiveChat(fileHash);
    } catch (error) {
      console.error('Chat PDF Error:', error);
      alert(language === 'ar' ? 'فشل معالجة الملف' : 'Failed to process file');
      clearActive();
      setPdfName('');
    } finally {
      stopLoading();
    }
  };

  const loadPreviousChat = async (fileHash: string, fileName: string) => {
    setPdfName(fileName);
    await setActiveChat(fileHash);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !pdfContext) return;

    const userMessage = { role: 'user' as const, content: inputText.trim() };
    setInputText('');
    await addMessageToActive(userMessage);

    try {
      let response = '';

      // Fallback for image-based docs when loading from history since images aren't cached
      response = await aiService.generateResponse(userMessage.content, pdfContext);
      
      await addMessageToActive({ role: 'ai' as const, content: response });
    } catch (error) {
      await addMessageToActive({ role: 'ai' as const, content: 'Sorry, I encountered an error answering your question.' });
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] max-w-7xl mx-auto flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Sidebar for History */}
      <div className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 hidden md:flex flex-col">
        <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100 mb-4 px-2">
          <Clock className="w-5 h-5 text-blue-500" />
          {language === 'ar' ? 'محادثات سابقة' : 'Previous Chats'}
        </h3>
        <div className="flex-grow overflow-y-auto space-y-2 pr-1">
          {historyEntries.map(entry => (
            <button 
              key={entry.fileHash}
              onClick={() => loadPreviousChat(entry.fileHash, entry.fileName)}
              className={`w-full text-left p-3 rounded-xl transition-colors text-sm truncate flex flex-col gap-1 ${currentFileHash === entry.fileHash ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
            >
              <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{entry.fileName}</span>
              <span className="text-[10px] text-slate-400">{new Date(entry.timestamp).toLocaleDateString()}</span>
            </button>
          ))}
          {historyEntries.length === 0 && (
            <div className="text-center text-sm text-slate-500 mt-10">
              {language === 'ar' ? 'لا يوجد محادثات سابقة' : 'No previous chats'}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col gap-6 w-full max-w-4xl min-w-0">
        <div className="flex items-center justify-between flex-shrink-0">
           <div className="flex items-center gap-3 w-full">
              <div className="p-3 bg-blue-500 text-white rounded-2xl flex-shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-grow">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 truncate">
                  {language === 'ar' ? 'تحدث إلى ملف PDF' : 'Chat with PDF'}
                </h1>
                {pdfName && <p className="text-xs text-slate-500 font-mono truncate">{pdfName}</p>}
              </div>
           </div>
           {pdfName && (
             <div className="flex gap-2 flex-shrink-0">
              {isOcrProcessing && (
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  <span>{language === 'ar' ? 'جاري استخدام OCR...' : 'OCR running...'}</span>
                </div>
              )}
              <button 
                onClick={() => { clearActive(); setPdfName(''); setPdfPages([]); }}
                className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                title={language === 'ar' ? 'إغلاق المحادثة' : 'Close chat'}
              >
                <Trash2 className="w-5 h-5" />
              </button>
             </div>
           )}
        </div>

        {!currentFileHash ? (
          <div className="flex-grow flex flex-col justify-center items-center">
            <div className="max-w-md mx-auto w-full">
              <FileUpload 
                onFileSelect={handleFileUpload} 
                accept=".pdf,image/*"
                icon={<FileSearch className="w-10 h-10" />}
              />
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden min-h-0">
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
              {activeChatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-blue-500 text-white'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[85%] md:max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tr-none' 
                      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div className="relative">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={language === 'ar' ? 'اسأل أي شيء عن الملف...' : 'Ask anything about the file...'}
                  className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 pr-16 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className={language === 'ar' ? 'rotate-180 w-5 h-5' : 'w-5 h-5'} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
