import React, { useState, useRef, useCallback } from 'react';
import { ArrowRight, UploadCloud, CheckCircle, FileText, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface TemplateImporterProps {
  onBack: () => void;
  onImported: (template: any) => void;
}

export default function TemplateImporter({ onBack, onImported }: TemplateImporterProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [fields, setFields] = useState<any[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('شخصي');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<{show: boolean, x: number, y: number, selectedText: string, range: Range | null}>({
    show: false, x: 0, y: 0, selectedText: '', range: null
  });
  const [newFieldName, setNewFieldName] = useState('');

  const processFile = async (selectedFile: File) => {
    setIsProcessing(true);
    setFile(selectedFile);
    
    try {
      if (selectedFile.name.endsWith('.docx')) {
        const { default: mammoth } = await import('mammoth');
        const buffer = await selectedFile.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
        setHtmlContent(result.value);
        setStep(2);
      } else {
        toast.error('عذراً، نستقبل ملفات DOCX فقط حالياً في أداة تحويل القوالب الذكية.');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء معالجة الملف');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() && contentRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setPopover({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 40,
        selectedText: selection.toString().trim(),
        range: range.cloneRange()
      });
      setNewFieldName('');
    } else {
      setPopover({ ...popover, show: false });
    }
  };

  const addField = () => {
    if (!newFieldName.trim() || !popover.range) return;
    
    // Create new field definition
    const fieldKey = newFieldName.trim().replace(/\s+/g, '_').toLowerCase();
    
    // Add to fields list
    const newField = {
      key: fieldKey,
      label: newFieldName.trim(),
      type: 'text',
      required: true
    };
    
    setFields(prev => {
      // Avoid duplicates
      if (prev.find(f => f.key === fieldKey)) return prev;
      return [...prev, newField];
    });
    
    // Replace selected text with variable placeholder in HTML
    const marker = document.createElement('span');
    marker.style.backgroundColor = '#fde68a';
    marker.style.padding = '2px 4px';
    marker.style.borderRadius = '4px';
    marker.style.fontWeight = 'bold';
    marker.style.color = '#b45309';
    marker.textContent = `{{ ${fieldKey} }}`;
    
    popover.range.deleteContents();
    popover.range.insertNode(marker);
    
    // Update raw HTML content string to match
    if (contentRef.current) {
      setHtmlContent(contentRef.current.innerHTML);
    }
    
    setPopover({ ...popover, show: false });
    window.getSelection()?.removeAllRanges();
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('أدخل اسم القالب');
      return;
    }
    
    // Prepare the raw HTML with variables
    let finalHtml = htmlContent;
    
    // Convert visually marked spans back to actual JS template literals
    // Example: <span style="...">\${{ my_var }}</span> -> \${data.my_var || ''}
    
    // Since we injected \${{ my_var }} exactly in the span, we just need to take the raw innerHTML 
    // of our contentRef and do a global string replacement for the template builder.
    
    const wrapperElement = document.createElement('div');
    wrapperElement.innerHTML = htmlContent;
    
    // Function that will be serialized as string for getHTML
    const finalTemplateObj = {
      id: `imported-${uuidv4()}`,
      name: templateName,
      category: templateCategory,
      description: 'قالب تم استيراده بواسطة المستخدم',
      color: '#475569',
      accentColor: '#94a3b8',
      icon: '📂',
      isImported: true,
      fields: fields,
      // We store the raw HTML format with our placeholders
      rawHtml: htmlContent
    };
    
    // Save to local storage
    try {
      localStorage.setItem(`imported_${finalTemplateObj.id}`, JSON.stringify(finalTemplateObj));
      toast.success('تم استيراد القالب وحفظه بنجاح!');
      onImported(finalTemplateObj);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء حفظ القالب المستورد.');
    }
  };

  return (
    <div className="importer-container">
      <div className="editor-header" style={{ borderBottom: 'none', padding: '0 0 20px 0' }}>
        <button onClick={onBack} className="back-btn">
          <ArrowRight size={20} />
          العودة للمكتبة
        </button>
      </div>
      
      <div className="stepper">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-circle">1</div>
          <div className="step-label">رفع الملف</div>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-circle">2</div>
          <div className="step-label">تحديد الحقول</div>
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <div className="step-label">حفظ القالب</div>
        </div>
      </div>

      {step === 1 && (
        <div>
          <h2 style={{ marginBottom:'20px', color:'#0f172a' }}>استيراد مستند جديد (DOCX)</h2>
          <div 
            className="drop-zone"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              id="fileInput" 
              style={{ display: 'none' }} 
              accept=".docx"
              onChange={handleFileInput}
            />
            <UploadCloud size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize:'18px', marginBottom:'8px' }}>اسحب وأفلت الملف هنا</h3>
            <p style={{ color:'#64748b', marginBottom:'20px' }}>أو انقر لاختيار ملف من جهازك</p>
            <button 
              className="use-btn" 
              style={{ width: 'auto', padding: '10px 24px' }}
              onClick={() => document.getElementById('fileInput')?.click()}
              disabled={isProcessing}
            >
              {isProcessing ? 'جاري المعالجة...' : 'تصفح الملفات'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
            <h2 style={{ color:'#0f172a' }}>حدد الحقول المتغيرة</h2>
            <button 
              className="export-btn" 
              style={{ padding:'8px 20px' }}
              onClick={() => setStep(3)}
            >
              التالي <ArrowRight size={16} />
            </button>
          </div>
          <p style={{ color:'#64748b', marginBottom:'16px' }}>
            قم بتظليل (Select) أي نص داخل المستند أدناه لجعله حقلاً قابلاً للإدخال من قِبل المستخدم لاحقاً.
          </p>
          
          <div 
            className="importer-preview"
            ref={contentRef}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
          />
          
          {fields.length > 0 && (
            <div style={{ marginTop:'20px' }}>
              <h3 style={{ fontSize:'16px', marginBottom:'12px', color:'#334155' }}>الحقول المضافة:</h3>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {fields.map(f => (
                  <span key={f.key} style={{ background:'#e0f2fe', color:'#0284c7', padding:'4px 10px', borderRadius:'16px', fontSize:'13px', fontWeight:600 }}>
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Custom Popover */}
          {popover.show && (
            <div style={{
              position: 'fixed',
              top: `${popover.y}px`,
              left: `${popover.x}px`,
              transform: 'translate(-50%, -100%)',
              background: 'white',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              padding: '12px',
              borderRadius: '8px',
              zIndex: 1000,
              display: 'flex',
              gap: '8px',
              border: '1px solid #e2e8f0',
              direction: 'rtl'
            }}>
              <div>
                <input 
                  type="text" 
                  value={newFieldName}
                  onChange={e => setNewFieldName(e.target.value)}
                  placeholder="اسم الحقل (مثل: اسم الشركة)"
                  style={{ padding:'6px 10px', border:'1px solid #cbd5e1', borderRadius:'4px', outline:'none' }}
                  autoFocus
                  onKeyDown={e => { if(e.key === 'Enter') addField() }}
                />
              </div>
              <button 
                onClick={addField}
                style={{ background:'#3b82f6', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer' }}
              >
                أضف
              </button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 style={{ marginBottom:'20px', color:'#0f172a' }}>حفظ القالب</h2>
          <div className="editor-form" style={{ padding: 0 }}>
            <div className="form-group">
              <label className="form-label">اسم القالب <span className="required-mark">*</span></label>
              <input 
                type="text" 
                className="form-input" 
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="مثال: نموذج تقييم الأداء المحفوظ"
              />
            </div>
            <div className="form-group">
              <label className="form-label">الفئة</label>
              <select 
                className="form-input"
                value={templateCategory}
                onChange={e => setTemplateCategory(e.target.value)}
              >
                <option value="إداري">إداري</option>
                <option value="قانوني">قانوني</option>
                <option value="شخصي">شخصي</option>
              </select>
            </div>
            
            <div style={{ marginTop:'30px', display:'flex', gap:'16px' }}>
              <button className="save-btn" onClick={() => setStep(2)}>
                رجوع
              </button>
              <button className="export-btn" onClick={handleSaveTemplate}>
                <Save size={18} style={{ display:'inline' }} /> حفظ القالب في مكتبتي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
