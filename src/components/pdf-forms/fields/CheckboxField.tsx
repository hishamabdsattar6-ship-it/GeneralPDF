import React from 'react';

interface CheckboxFieldProps {
  mode: 'design' | 'fill';
  field: any;
  value?: boolean;
  onChange?: (val: boolean) => void;
}

export default function CheckboxField({ mode, field, value, onChange }: CheckboxFieldProps) {
  if (mode === 'design') {
    return (
      <div style={{ width: '100%', height: '100%', border: '2px solid #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
        <span style={{ color: '#d1d5db' }}>✓</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <input
        type="checkbox"
        checked={value || false}
        onChange={e => onChange?.(e.target.checked)}
        style={{ width: '80%', height: '80%', cursor: 'pointer' }}
      />
    </div>
  );
}
