import React, { useState, useEffect } from 'react';
import TemplateGallery from '../components/templates/TemplateGallery';
import TemplateEditor from '../components/templates/TemplateEditor';
import TemplateImporter from '../components/templates/TemplateImporter';
import '../components/templates/templates.css';

export default function TemplatesPage() {
  const [view, setView] = useState<'gallery' | 'editor' | 'import'>('gallery');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [importedTemplates, setImportedTemplates] = useState<any[]>([]);

  // Load imported templates on mount
  useEffect(() => {
    loadImportedTemplates();
  }, []);

  const loadImportedTemplates = () => {
    try {
      const templates = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('imported_')) {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          
          // Reconstruct the getHTML function for imported templates since functions are lost in JSON
          if (data.isImported && data.rawHtml) {
            data.getHTML = (formData: any) => {
              let html = data.rawHtml;
              // replace all {{ key }} with formData.key
              data.fields.forEach((field: any) => {
                const regex = new RegExp(`\\{{\\s*${field.key}\\s*\\}}`, 'g');
                html = html.replace(regex, formData[field.key] || '');
              });
              
              // Wrap with full HTML document structure for display
              return `<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Tajawal:wght@400;500;700&display=swap');
  * { box-sizing: border-box; }
  body { width: 794px; min-height: 1123px; font-family: 'Tajawal', sans-serif; background: #fff; direction: rtl; padding: 40px; margin: 0; }
  p { line-height: 2; margin-bottom: 12px; }
</style>
</head>
<body>
${html}
</body>
</html>`;
            };
          }
          templates.push(data);
        }
      }
      setImportedTemplates(templates);
    } catch (err) {
      console.error('Failed to load imported templates', err);
    }
  };

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setView('editor');
  };

  const handleImported = (newTemplate: any) => {
    loadImportedTemplates(); // reload from ls
    setView('gallery');
  };

  return (
    <div className="templates-page">
      <div className="templates-container">
        {view === 'gallery' && (
          <TemplateGallery 
            onSelectTemplate={handleSelectTemplate} 
            onImport={() => setView('import')} 
            importedTemplates={importedTemplates}
          />
        )}
        
        {view === 'editor' && selectedTemplate && (
          <TemplateEditor 
            template={selectedTemplate} 
            onBack={() => setView('gallery')} 
          />
        )}
        
        {view === 'import' && (
          <TemplateImporter 
            onBack={() => setView('gallery')} 
            onImported={handleImported}
          />
        )}
      </div>
    </div>
  );
}
