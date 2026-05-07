import React, { useState, useRef } from 'react';
import FieldToolbar from './FieldToolbar';
import FormPreview from './FormPreview';
import TextField from './fields/TextField';
import CheckboxField from './fields/CheckboxField';
import RadioGroupField from './fields/RadioGroupField';
import DropdownField from './fields/DropdownField';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfFillerProps {
  onBack: () => void;
}

export default function PdfFiller({ onBack }: PdfFillerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFieldType, setActiveFieldType] = useState<any>(null);
  const [isPreview, setIsPreview] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const addField = (fieldType: any, x: number, y: number) => {
    const newField = {
      ...fieldType,
      id: Date.now().toString(),
      x,
      y,
      width: fieldType.defaultWidth,
      height: fieldType.defaultHeight,
      name: `${fieldType.type}_${Date.now()}`
    };
    setFields(prev => [...prev, newField]);
    setSelectedId(newField.id);
  };

  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; startX: number; startY: number; initialWidth: number; initialHeight: number } | null>(null);

  const handleMouseDown = (field: any, e: React.MouseEvent) => {
    if (activeFieldType) return;
    e.stopPropagation();
    setSelectedId(field.id);
    setDragging({
      id: field.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: field.x,
      initialY: field.y
    });
  };

  const handleResizeStart = (field: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing({
      id: field.id,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: field.width,
      initialHeight: field.height
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;
      updateField(dragging.id, {
        x: Math.max(0, dragging.initialX + dx),
        y: Math.max(0, dragging.initialY + dy)
      });
    } else if (resizing) {
      const dx = e.clientX - resizing.startX;
      const dy = e.clientY - resizing.startY;
      updateField(resizing.id, {
        width: Math.max(20, resizing.initialWidth + dx),
        height: Math.max(20, resizing.initialHeight + dy)
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    if (uploadedFile.type !== 'application/pdf') {
      alert('الرجاء رفع ملف PDF');
      return;
    }
    
    setFile(uploadedFile);
    
    // Render first page as background
    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        setPageImage(canvas.toDataURL('image/png'));
      }
    } catch (err) {
      console.error('Error rendering PDF:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!file) return;
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;
    try {
      const data = JSON.parse(rawData);
      
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        addField(data, e.clientX - rect.left, e.clientY - rect.top);
      }
    } catch (err) {
      console.error('Failed to parse drag data', err);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeFieldType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addField(activeFieldType, x, y);
      setActiveFieldType(null); // Clear after placing
    } else if (e.target === canvasRef.current) {
      setSelectedId(null);
    }
  };

  const updateField = (id: string, updates: any) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const renderFieldDesign = (field: any) => {
    const props = { mode: 'design' as const, field };
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return <div style={{ opacity: 0.8 }}><TextField {...props} /></div>;
      case 'checkbox':
        return <div style={{ opacity: 0.8 }}><CheckboxField {...props} /></div>;
      case 'radio':
        return <div style={{ opacity: 0.8 }}><RadioGroupField {...props} /></div>;
      case 'dropdown':
        return <div style={{ opacity: 0.8 }}><DropdownField {...props} /></div>;
      case 'signature':
        return <div style={{ border: '1px dashed red', height: '100%', background: 'rgba(255,0,0,0.1)' }}>منطقة توقيع</div>;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', direction: 'rtl' }} className="pdf-forms-page">
      <div style={{ padding: '12px 24px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <button onClick={onBack} style={{ padding: '6px 12px', cursor: 'pointer', background: '#f3f4f6', border: 'none', borderRadius: '4px' }}>&larr; رجوع</button>
         {file && <button onClick={() => setIsPreview(true)} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>وضع التعبئة والتصدير &rarr;</button>}
      </div>

      {!file ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f9fafb' }}>
          <div style={{ padding: '40px', border: '2px dashed #d1d5db', borderRadius: '12px', textAlign: 'center', background: 'white' }}>
            <h2 style={{ margin: '0 0 16px 0', color: '#374151' }}>ارفع ملف PDF لإضافة حقول تفاعلية فوقه</h2>
            <input type="file" accept="application/pdf" onChange={handleFileUpload} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <FieldToolbar onSelect={setActiveFieldType} selectedType={activeFieldType?.type} />

          <div 
            className="canvas-area" 
            style={{ flex: 1, overflow: 'auto', position: 'relative' }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div 
              className="a4-page" 
              ref={canvasRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={handleCanvasClick}
              style={{
                 backgroundImage: pageImage ? `url(${pageImage})` : 'none',
                 backgroundSize: 'contain',
                 backgroundRepeat: 'no-repeat',
                 backgroundPosition: 'top center',
                 cursor: activeFieldType ? 'crosshair' : (dragging ? 'grabbing' : 'default')
              }}
            >
              {fields.map(field => (
                <div
                  key={field.id}
                  className={`field-wrapper ${selectedId === field.id ? 'selected' : ''}`}
                  style={{ 
                    left: field.x, 
                    top: field.y, 
                    width: field.width, 
                    height: field.height,
                    cursor: dragging?.id === field.id ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={(e) => handleMouseDown(field, e)}
                >
                  {renderFieldDesign(field)}
                  {selectedId === field.id && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                        style={{ 
                          position: 'absolute', 
                          top: -10, 
                          right: -10, 
                          background: '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '50%', 
                          width: 20, 
                          height: 20, 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 20
                        }}
                      >×</button>
                      <div 
                        className="resize-handle" 
                        style={{
                          position: 'absolute',
                          bottom: -4,
                          right: -4,
                          width: 10,
                          height: 10,
                          background: '#4f46e5',
                          cursor: 'se-resize',
                          borderRadius: '2px',
                          zIndex: 20
                        }}
                        onMouseDown={(e) => handleResizeStart(field, e)} 
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isPreview && file && (
        <FormPreview fields={fields} mode="existing" pdfFile={file} formName="نموذج" onClose={() => setIsPreview(false)} />
      )}
    </div>
  );
}
