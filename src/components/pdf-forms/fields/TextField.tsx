import React from 'react';

interface TextFieldProps {
  mode: 'design' | 'fill';
  field: any;
  value?: string;
  onChange?: (val: string) => void;
}

export default function TextField({ mode, field, value, onChange }: TextFieldProps) {
  if (mode === 'design') {
    return (
      <div style={{ width: '100%', height: '100%', background: '#e0e7ff', display: 'flex', alignItems: 'center', padding: '0 8px', color: '#4f46e5', fontSize: '13px', overflow: 'hidden' }}>
        {field.placeholder || field.label || 'نص...'}
      </div>
    );
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // optional: prevent LTR override
  };

  if (field.multiline) {
    return (
      <textarea
        placeholder={field.placeholder || field.label}
        value={value || ''}
        onChange={e => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ width: '100%', height: '100%', direction: 'rtl', textAlign: 'right', resize: 'none' }}
      />
    );
  }

  return (
    <input
      type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
      placeholder={field.placeholder || field.label}
      value={value || ''}
      onChange={e => onChange?.(e.target.value)}
      onKeyDown={handleKeyDown}
      style={{ width: '100%', height: '100%', direction: 'rtl', textAlign: 'right' }}
    />
  );
}
