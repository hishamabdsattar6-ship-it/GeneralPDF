import React from 'react';

interface RadioGroupFieldProps {
  mode: 'design' | 'fill';
  field: any;
  value?: string;
  onChange?: (val: string) => void;
}

export default function RadioGroupField({ mode, field, value, onChange }: RadioGroupFieldProps) {
  const options = field.options || ['خيار 1', 'خيار 2'];
  const isHorizontal = field.direction === 'horizontal';

  if (mode === 'design') {
    return (
      <div style={{ display: 'flex', gap: '8px', flexDirection: isHorizontal ? 'row' : 'column', width: '100%', height: '100%', alignItems: isHorizontal ? 'center' : 'flex-start', justifyContent: isHorizontal ? 'space-between' : 'flex-start', padding: '4px' }}>
        {options.map((opt: string, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #9ca3af' }} />
            <span>{opt}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexDirection: isHorizontal ? 'row' : 'column', width: '100%', height: '100%', alignItems: isHorizontal ? 'center' : 'flex-start' }}>
      {options.map((opt: string, i: number) => (
        <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
          <input
            type="radio"
            name={field.name || `radio_${field.id}`}
            value={opt}
            checked={value === opt}
            onChange={() => onChange?.(opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  );
}
