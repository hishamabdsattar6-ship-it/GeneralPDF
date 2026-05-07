import { useAppStore } from '../store/useAppStore';
import { translations } from '../utils/translations';
import { Link } from 'react-router-dom';
import { Layers, SplitSquareHorizontal, Minimize, Edit3, PenTool, PlusSquare, Eye, Hash } from 'lucide-react';

export default function NormalTools() {
  const { language } = useAppStore();
  const t = translations[language];

  const tools = [
    { id: 'merge', path: '/tools/merge', icon: Layers, title: t.mergePdf, desc: t.mergePdfDesc, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { id: 'split', path: '/tools/split', icon: SplitSquareHorizontal, title: t.splitPdf, desc: t.splitPdfDesc, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { id: 'compress', path: '/tools/compress', icon: Minimize, title: t.compressPdf, desc: t.compressPdfDesc, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
    { id: 'edit', path: '/tools/edit', icon: Edit3, title: t.editPdf, desc: t.editPdfDesc, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30' },
    { id: 'sign', path: '/tools/sign', icon: PenTool, title: t.signPdf, desc: t.signPdfDesc, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { id: 'create', path: '/tools/create', icon: PlusSquare, title: t.createPdf, desc: t.createPdfDesc, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/30' },
    { id: 'number', path: '/tools/number', icon: Hash, title: t.numberPdf, desc: t.numberPdfDesc, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/30' },
    { id: 'view', path: '/tools/view', icon: Eye, title: t.viewPdf, desc: t.viewPdfDesc, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/30' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--primary-blue)] mb-4">{t.normalTools}</h1>
        <p className="text-[var(--text-muted)] text-lg">{t.toolsList}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link 
            key={tool.id} 
            to={tool.path}
            className="flex flex-col p-6 bg-[var(--header-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform`}>
              <tool.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--primary-blue)] transition-colors">{tool.title}</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed flex-grow">
              {tool.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
