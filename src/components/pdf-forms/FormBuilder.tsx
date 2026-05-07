import React, { useState, useRef } from 'react';
import FieldToolbar from './FieldToolbar';
import FormPreview from './FormPreview';
import TextField from './fields/TextField';
import CheckboxField from './fields/CheckboxField';
import RadioGroupField from './fields/RadioGroupField';
import DropdownField from './fields/DropdownField';

interface FormBuilderProps {
  onBack: () => void;
}

export default function FormBuilder({ onBack }: FormBuilderProps) {
  const [fields, setFields] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFieldType, setActiveFieldType] = useState<any>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [formName, setFormName] = useState('نموذج جديد');
  
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;
    try {
      const data = JSON.parse(rawData);
      
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        addField(data, e.clientX - rect.left, e.clientY - rect.top);
      }
    } catch (e) {
      console.error('Failed to parse drag data', e);
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

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const updateField = (id: string, updates: any) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const selectedField = fields.find(f => f.id === selectedId);

  const renderFieldDesign = (field: any) => {
    const props = { mode: 'design' as const, field };
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return <TextField {...props} />;
      case 'checkbox':
        return <CheckboxField {...props} />;
      case 'radio':
        return <RadioGroupField {...props} />;
      case 'dropdown':
        return <DropdownField {...props} />;
      case 'signature':
        return <div style={{ border: '1px dashed #ccc', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: '4px', justifyContent: 'center' }}><hr style={{ width: '80%', borderColor: '#000' }}/></div>;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', direction: 'rtl' }} className="pdf-forms-page">
      <div style={{ padding: '12px 24px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onBack} style={{ padding: '6px 12px', cursor: 'pointer', background: '#f3f4f6', border: 'none', borderRadius: '4px' }}>&larr; رجوع</button>
          <input 
            value={formName} 
            onChange={e => setFormName(e.target.value)}
            style={{ fontSize: '18px', fontWeight: 'bold', border: 'none', outline: 'none', background: 'transparent' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setIsPreview(true)} style={{ padding: '8px 16px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>معاينة 👁</button>
        </div>
      </div>

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
            onDragOver={handleDragOver}
            onClick={handleCanvasClick}
            style={{ cursor: activeFieldType ? 'crosshair' : 'default' }}
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
                        fontSize: '12px',
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

        <div className="properties-panel">
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151' }}>الخصائص</h3>
          {selectedField ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <label>تسمية الحقل (Label)</label>
                <input value={selectedField.label || ''} onChange={e => updateField(selectedField.id, { label: e.target.value })} style={{ width: '100%', padding: '6px', marginTop: '4px' }} />
              </div>
              <div>
                <label>اسم المتغير (Name)</label>
                <input value={selectedField.name || ''} onChange={e => updateField(selectedField.id, { name: e.target.value })} style={{ width: '100%', padding: '6px', marginTop: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label>X</label>
                  <input type="number" value={Math.round(selectedField.x)} onChange={e => updateField(selectedField.id, { x: Number(e.target.value) })} style={{ width: '100%', padding: '6px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Y</label>
                  <input type="number" value={Math.round(selectedField.y)} onChange={e => updateField(selectedField.id, { y: Number(e.target.value) })} style={{ width: '100%', padding: '6px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <label>العرض</label>
                  <input type="number" value={Math.round(selectedField.width)} onChange={e => updateField(selectedField.id, { width: Number(e.target.value) })} style={{ width: '100%', padding: '6px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>الارتفاع</label>
                  <input type="number" value={Math.round(selectedField.height)} onChange={e => updateField(selectedField.id, { height: Number(e.target.value) })} style={{ width: '100%', padding: '6px' }} />
                </div>
              </div>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                <input type="checkbox" checked={selectedField.required} onChange={e => updateField(selectedField.id, { required: e.target.checked })} />
                إلزامي
              </label>

              {(selectedField.type === 'radio' || selectedField.type === 'dropdown') && (
                <div style={{ marginTop: '8px' }}>
                  <label>الخيارات (مفصولة بفاصلة)</label>
                  <textarea 
                    value={(selectedField.options || []).join(',')} 
                    onChange={e => updateField(selectedField.id, { options: e.target.value.split(',').map((s: string) => s.trim()) })}
                    style={{ width: '100%', padding: '6px', marginTop: '4px', resize: 'vertical' }}
                  />
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontSize: '13px' }}>اختر حقلاً لتعديل خصائصه</p>
          )}
        </div>
      </div>

      {isPreview && (
        <FormPreview fields={fields} mode="scratch" formName={formName} onClose={() => setIsPreview(false)} />
      )}
    </div>
  );
}
