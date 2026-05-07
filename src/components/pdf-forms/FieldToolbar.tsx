import React from 'react';

const fieldTypes = [
  { type: 'text', label: 'حقل نصي', defaultWidth: 150, defaultHeight: 30, icon: '📝' },
  { type: 'checkbox', label: 'مربع اختيار', defaultWidth: 24, defaultHeight: 24, icon: '☑️' },
  { type: 'radio', label: 'اختيار متعدد', defaultWidth: 150, defaultHeight: 60, icon: '🔘' },
  { type: 'dropdown', label: 'قائمة منسدلة', defaultWidth: 150, defaultHeight: 30, icon: '📋' },
  { type: 'signature', label: 'توقيع', defaultWidth: 200, defaultHeight: 50, icon: '✍️' },
];

interface FieldToolbarProps {
  onSelect?: (fieldType: any) => void;
  selectedType?: string | null;
}

export default function FieldToolbar({ onSelect, selectedType }: FieldToolbarProps) {
  const handleDragStart = (e: React.DragEvent, fieldType: any) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      ...fieldType,
      id: Date.now().toString(),
    }));
  };

  return (
    <div className="field-toolbar">
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#374151' }}>أنواع الحقول</h3>
      
      {fieldTypes.map(f => (
        <div
          key={f.type}
          className={`field-card ${selectedType === f.type ? 'active' : ''}`}
          style={selectedType === f.type ? { borderColor: '#6366f1', background: '#eef2ff' } : {}}
          draggable
          onDragStart={(e) => handleDragStart(e, f)}
          onClick={() => onSelect?.(f)}
        >
          <span style={{ fontSize: '18px' }}>{f.icon}</span>
          <span style={{ fontWeight: 500, color: '#4b5563', fontSize: '14px' }}>{f.label}</span>
        </div>
      ))}
    </div>
  );
}
