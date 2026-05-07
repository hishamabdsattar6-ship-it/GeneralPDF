import React, { useState } from 'react';
import FormBuilder from './FormBuilder';
import PdfFiller from './PdfFiller';
import './pdf-forms.css';

export default function PdfFormsPage() {
  const [mode, setMode] = useState<'home' | 'builder' | 'filler'>('home');

  if (mode === 'builder') return <FormBuilder onBack={() => setMode('home')} />;
  if (mode === 'filler') return <PdfFiller onBack={() => setMode('home')} />;

  return (
    <div className="pdf-forms-page" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '8px', color: '#111827' }}>نماذج PDF التفاعلية</h1>
      <p style={{ textAlign: 'center', marginBottom: '48px', color: '#6b7280' }}>
        أنشئ نماذج قابلة للتعبئة من الصفر أو أضف حقولاً تفاعلية فوق ملفات PDF موجودة
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        <div 
          onClick={() => setMode('builder')}
          style={{ padding: '32px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#4f46e5'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔨</div>
          <h2 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>أنشئ نموذجاً من الصفر</h2>
          <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.6 }}>صمم نموذجاً تفاعلياً بالسحب والإفلات وحقول متنوعة باللغة العربية، وصدّره كملف PDF تفاعلي.</p>
        </div>

        <div 
          onClick={() => setMode('filler')}
          style={{ padding: '32px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#4f46e5'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
          <h2 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>عبّئ PDF موجود</h2>
          <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.6 }}>ارفع ملف PDF وأضف حقولاً تفاعلية فوق محتواه بسهولة، ثم احفظ الملف المعبّأ نهائياً.</p>
        </div>

      </div>
    </div>
  );
}
