import React, { useState } from 'react';
import TextField from './fields/TextField';
import CheckboxField from './fields/CheckboxField';
import RadioGroupField from './fields/RadioGroupField';
import DropdownField from './fields/DropdownField';
import { generateInteractivePDF, fillExistingPDF, buildFormConfig, downloadPDF } from './pdf-forms-utils';

interface FormPreviewProps {
  fields: any[];
  mode: 'scratch' | 'existing';
  pdfFile?: File;
  formName: string;
  onClose: () => void;
}

export default function FormPreview({ fields, mode, pdfFile, formName, onClose }: FormPreviewProps) {
  const [formData, setFormData] = useState<any>({});
  const [isExporting, setIsExporting] = useState(false);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (mode === 'scratch') {
        const config = buildFormConfig(fields, formName);
        const bytes = await generateInteractivePDF(config);
        downloadPDF(bytes, `${formName || 'نموذج'}.pdf`);
      } else if (mode === 'existing' && pdfFile) {
        const bytes = await fillExistingPDF(pdfFile, fields, formData);
        downloadPDF(bytes, `${formName || 'نموذج_معبأ'}.pdf`);
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تصدير الملف');
    }
    setIsExporting(false);
  };

  const renderField = (field: any) => {
    const props = {
      mode: 'fill' as const,
      field,
      value: formData[field.name || `field_${field.id}`],
      onChange: (val: any) => handleFieldChange(field.name || `field_${field.id}`, val)
    };

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
        return (
          <div style={{ width: '100%', height: '100%', background: '#fff', border: '1px solid #ccc', position: 'relative' }}>
             <canvas style={{ width: '100%', height: '100%' }}></canvas>
             <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: '1px solid #000', textAlign: 'center', fontSize: '10px' }}>توقيع</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', overflowY: 'auto' }}>
      <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>إغلاق المعاينة</button>
        <button onClick={handleExport} disabled={isExporting} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isExporting ? 'جاري التصدير...' : 'تصدير PDF النهائي ↓'}
        </button>
      </div>

      <div className="a4-page" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* If we had an existing PDF, ideally we'd show the image background here too, but for simplicity we just render the fields on white or assume the user knows. */}
        {fields.map(f => (
          <div key={f.id} style={{ position: 'absolute', left: f.x, top: f.y, width: f.width, height: f.height }}>
            {renderField(f)}
          </div>
        ))}
      </div>
    </div>
  );
}
