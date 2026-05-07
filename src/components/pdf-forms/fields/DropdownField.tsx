import React from 'react';

interface DropdownFieldProps {
  mode: 'design' | 'fill';
  field: any;
  value?: string;
  onChange?: (val: string) => void;
}

export default function DropdownField({ mode, field, value, onChange }: DropdownFieldProps) {
  const options = field.options || ['خيار 1', 'خيار 2'];

  if (mode === 'design') {
    return (
      <div style={{ width: '100%', height: '100%', background: '#f3f4f6', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', fontSize: '13px' }}>
        <span>{field.placeholder || field.label || 'اختر...'}</span>
        <span style={{ fontSize: '10px' }}>▼</span>
      </div>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={e => onChange?.(e.target.value)}
      style={{ width: '100%', height: '100%', direction: 'rtl' }}
    >
      <option value="" disabled>{field.placeholder || 'اختر...'}</option>
      {options.map((opt: string, i: number) => (
        <option key={i} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
