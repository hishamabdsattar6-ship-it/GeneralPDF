import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Download, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface TemplateEditorProps {
  template: any;
  onBack: () => void;
}

export default function TemplateEditor({ template, onBack }: TemplateEditorProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [exporting, setExporting] = useState(false);
  const [scale, setScale] = useState(0.8);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Load draft if exists
  useEffect(() => {
    const loadDraft = () => {
      try {
        const draft = localStorage.getItem(`draft_${template.id}`);
        if (draft) {
          setFormData(JSON.parse(draft).formData);
        }
      } catch (err) {
        console.error("Failed to load draft:", err);
      }
    };
    loadDraft();
    
    // Scale preview based on window width
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 1024) setScale(0.4);
      else if (width < 1400) setScale(0.6);
      else setScale(0.8);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [template.id]);

  // Update preview
  useEffect(() => {
    if (iframeRef.current) {
      const htmlContent = template.getHTML(formData);
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [formData, template]);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(`draft_${template.id}`, JSON.stringify({ 
        formData, 
        timestamp: Date.now() 
      }));
      toast.success('تم حفظ المسودة بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ المسودة');
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    const toastId = toast.loading('جاري تجهيز المستند للتصدير...');
    
    try {
      // 1. Create a hidden iframe with full A4 dimensions
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'width:794px;height:1123px;position:fixed;left:-9999px;top:0;';
      document.body.appendChild(iframe);
      
      // 2. Render content into iframe
      const htmlContent = template.getHTML(formData);
      iframe.contentDocument!.open();
      iframe.contentDocument!.write(htmlContent);
      iframe.contentDocument!.close();
      
      // 3. Wait for fonts to load
      await new Promise(r => setTimeout(r, 2000));
      
      // 4. Import dynamic dependencies
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');
      
      // 5. Render to canvas
      const canvas = await html2canvas(iframe.contentDocument!.body, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 794,
        height: 1123
      });
      
      // 6. Output to PDF
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
      pdf.save(`${template.name}_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.pdf`);
      
      document.body.removeChild(iframe);
      toast.success('تم تصدير المستند بنجاح!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء التصدير', { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="editor-layout">
      {/* Editor Panel */}
      <div className="editor-panel">
        <div className="editor-header">
          <button onClick={onBack} className="back-btn">
            <ArrowRight size={20} />
            العودة
          </button>
          <div className="editor-title">{template.icon} {template.name}</div>
        </div>
        
        <div className="editor-form">
          {template.fields.map((field: any) => (
            <div key={field.key} className="form-group">
              <label className="form-label">
                {field.label}
                {field.required && <span className="required-mark">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  className="form-input form-textarea"
                  value={formData[field.key] || ''}
                  onChange={e => handleInputChange(field.key, e.target.value)}
                  placeholder={`أدخل ${field.label}...`}
                />
              ) : field.type === 'date' ? (
                <input
                  type="date"
                  className="form-input"
                  value={formData[field.key] || ''}
                  onChange={e => handleInputChange(field.key, e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  className="form-input"
                  value={formData[field.key] || ''}
                  onChange={e => handleInputChange(field.key, e.target.value)}
                  placeholder={`أدخل ${field.label}...`}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="editor-footer">
          <button onClick={handleSaveDraft} className="save-btn">
            <Save size={18} style={{ display: 'inline', marginLeft: '5px' }} />
            حفظ كمسودة
          </button>
          <button 
            onClick={exportToPDF} 
            disabled={exporting}
            className="export-btn"
          >
            <Download size={18} />
            {exporting ? 'جاري التصدير...' : 'تصدير PDF'}
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="preview-panel">
        <div 
          className="preview-wrapper"
          style={{ transform: `scale(${scale})` }}
        >
          <iframe
            ref={iframeRef}
            style={{ width: '794px', height: '1123px', border: 'none' }}
            title="Preview"
          />
        </div>
      </div>
    </div>
  );
}
