import React, { useState } from 'react';
import { templatesData } from './templates-data';
import { Upload, ChevronRight } from 'lucide-react';

interface TemplateGalleryProps {
  onSelectTemplate: (template: any) => void;
  onImport: () => void;
  importedTemplates: any[];
}

export default function TemplateGallery({ onSelectTemplate, onImport, importedTemplates }: TemplateGalleryProps) {
  const [activeTab, setActiveTab] = useState('الكل');

  const allTemplates = [...templatesData, ...importedTemplates];

  const categories = ['الكل', ...Array.from(new Set(templatesData.map(t => t.category))), 'مستورد'];

  const filteredTemplates = allTemplates.filter(t => {
    if (activeTab === 'الكل') return true;
    if (activeTab === 'مستورد') return t.isImported;
    return t.category === activeTab && !t.isImported;
  });

  return (
    <div>
      <div className="gallery-header">
        <h1 className="gallery-title">مكتبة القوالب</h1>
        <button onClick={onImport} className="import-btn">
          <Upload size={18} />
          استورد قالباً خاصاً
        </button>
      </div>

      <div className="tabs-container">
        {categories.map(cat => (
          <button
            key={cat}
            className={`tab-btn ${activeTab === cat ? 'active' : ''}`}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid-gallery">
        {filteredTemplates.map(template => (
          <div key={template.id} className="template-card">
            <div 
              className="card-thumbnail" 
              style={{ background: `linear-gradient(135deg, ${template.color || '#3b82f6'}, ${template.accentColor || '#60a5fa'})` }}
            >
              <div className="card-icon">{template.icon || '📄'}</div>
              <div className="card-name-overlay">{template.name}</div>
            </div>
            <div className="card-content">
              <span className="card-category">{template.category || 'مستورد'}</span>
              <h3 className="card-title">{template.name}</h3>
              <p className="card-desc">{template.description}</p>
              <button 
                className="use-btn"
                onClick={() => onSelectTemplate(template)}
              >
                استخدم القالب
              </button>
            </div>
          </div>
        ))}
        {filteredTemplates.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
            لا توجد قوالب في هذا التصنيف.
          </div>
        )}
      </div>
    </div>
  );
}
