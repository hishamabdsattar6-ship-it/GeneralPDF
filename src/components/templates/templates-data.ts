export const templatesData = [
  {
    id: 'official-report',
    name: 'تقرير رسمي',
    category: 'إداري',
    description: 'تقارير رسمية احترافية للمؤسسات',
    color: '#1a3a5c',
    accentColor: '#d4a017',
    icon: '📊',
    fields: [
      { key: 'orgName', label: 'اسم المؤسسة', type: 'text', required: true },
      { key: 'reportNum', label: 'رقم التقرير', type: 'text', required: true },
      { key: 'date', label: 'التاريخ', type: 'date', required: true },
      { key: 'title', label: 'عنوان التقرير', type: 'text', required: true },
      { key: 'period', label: 'الفترة الزمنية', type: 'text', required: false },
      { key: 'summary', label: 'الملخص التنفيذي', type: 'textarea', required: true },
      { key: 'content', label: 'المحتوى الرئيسي', type: 'textarea', required: true },
      { key: 'recommendations', label: 'التوصيات', type: 'textarea', required: false },
      { key: 'preparedBy', label: 'اسم المعد', type: 'text', required: true },
      { key: 'jobTitle', label: 'المسمى الوظيفي', type: 'text', required: true }
    ],
    getHTML: (data) => `
<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Tajawal:wght@400;500;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:794px; min-height:1123px; font-family:'Tajawal',sans-serif; background:#fff; direction:rtl; }
  .header { background:linear-gradient(135deg,#1a3a5c,#2d5f8a); padding:40px; color:white; position:relative; }
  .header::after { content:''; position:absolute; bottom:0; right:0; width:100%; height:4px; background:linear-gradient(90deg,#d4a017,#f0c040); }
  .org-name { font-family:'Cairo',sans-serif; font-size:24px; font-weight:900; }
  .doc-title { font-size:18px; opacity:0.85; margin-top:8px; }
  .meta-bar { display:flex; gap:24px; background:#f8f9fa; padding:16px 40px; border-bottom:2px solid #e9ecef; font-size:13px; color:#555; }
  .meta-item span { font-weight:700; color:#1a3a5c; }
  .section { padding:24px 40px; }
  .section-title { font-family:'Cairo',sans-serif; font-size:16px; font-weight:700; color:#1a3a5c; border-right:4px solid #d4a017; padding-right:12px; margin-bottom:12px; }
  .content-text { line-height:1.9; color:#333; font-size:14px; white-space:pre-wrap; }
  .divider { height:1px; background:#e9ecef; margin:0 40px; }
  .footer { background:#f8f9fa; padding:20px 40px; margin-top:auto; border-top:2px solid #1a3a5c; display:flex; justify-content:space-between; align-items:center; position:absolute; bottom:0; width:100%; }
  .signature-box { text-align:center; }
  .sig-name { font-family:'Cairo',sans-serif; font-weight:700; color:#1a3a5c; }
</style>
</head>
<body style="position:relative; padding-bottom:120px;">
  <div class="header">
    <div class="org-name">${data.orgName || 'اسم المؤسسة'}</div>
    <div class="doc-title">${data.title || 'عنوان التقرير'}</div>
  </div>
  <div class="meta-bar">
    <div class="meta-item">رقم التقرير: <span>${data.reportNum || ''}</span></div>
    <div class="meta-item">التاريخ: <span>${data.date || ''}</span></div>
    ${data.period ? `<div class="meta-item">الفترة: <span>${data.period}</span></div>` : ''}
  </div>
  ${data.summary ? `
  <div class="section">
    <div class="section-title">الملخص التنفيذي</div>
    <div class="content-text">${data.summary}</div>
  </div>
  <div class="divider"></div>` : ''}
  <div class="section">
    <div class="section-title">المحتوى الرئيسي</div>
    <div class="content-text">${data.content || ''}</div>
  </div>
  ${data.recommendations ? `
  <div class="divider"></div>
  <div class="section">
    <div class="section-title">التوصيات</div>
    <div class="content-text">${data.recommendations}</div>
  </div>` : ''}
  <div class="footer">
    <div class="signature-box">
      <div style="width:140px;height:1px;background:#1a3a5c;margin:0 auto 8px"></div>
      <div class="sig-name">${data.preparedBy || 'اسم المعد'}</div>
      <div style="font-size:12px;color:#666">${data.jobTitle || 'المسمى الوظيفي'}</div>
    </div>
    <div style="font-size:11px;color:#999">وثيقة رسمية - ${data.orgName || 'المؤسسة'}</div>
  </div>
</body>
</html>`
  },
  {
    id: 'contract-agreement',
    name: 'عقد اتفاق',
    category: 'قانوني',
    description: 'عقد قانوني مبرم بين طرفين',
    color: '#2c3e50',
    accentColor: '#95a5a6',
    icon: '🤝',
    fields: [
      { key: 'date', label: 'تاريخ إبرام العقد', type: 'date', required: true },
      { key: 'party1Name', label: 'اسم الطرف الأول', type: 'text', required: true },
      { key: 'party1Id', label: 'هوية الطرف الأول', type: 'text', required: true },
      { key: 'party2Name', label: 'اسم الطرف الثاني', type: 'text', required: true },
      { key: 'party2Id', label: 'هوية الطرف الثاني', type: 'text', required: true },
      { key: 'agreementTopic', label: 'موضوع العقد', type: 'text', required: true },
      { key: 'terms', label: 'بنود العقد', type: 'textarea', required: true },
      { key: 'amount', label: 'المبلغ/المقابل المالي', type: 'text', required: false },
      { key: 'duration', label: 'مدة العقد', type: 'text', required: true }
    ],
    getHTML: (data) => `
<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Tajawal:wght@400;500;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:794px; min-height:1123px; font-family:'Tajawal',sans-serif; background:#fff; direction:rtl; padding:40px; position:relative; }
  .header { text-align:center; padding-bottom:30px; border-bottom:3px double #2c3e50; margin-bottom:30px; }
  .doc-title { font-family:'Cairo',sans-serif; font-size:28px; font-weight:900; color:#2c3e50; }
  .date-text { font-size:14px; margin-top:10px; color:#555; }
  .intro { font-size:16px; line-height:2; margin-bottom:30px; text-align:justify; }
  .party-name { font-weight:700; color:#2c3e50; }
  .section-title { font-family:'Cairo',sans-serif; font-size:18px; font-weight:700; color:#2c3e50; background:#f4f6f7; padding:8px 16px; border-radius:4px; margin:20px 0 10px 0; border-right:4px solid #95a5a6; }
  .content-text { line-height:2; color:#333; font-size:15px; white-space:pre-wrap; text-align:justify; padding:0 10px; }
  .signatures { display:flex; justify-content:space-between; margin-top:60px; padding-top:30px; border-top:1px solid #ddd; }
  .sig-block { width:40%; text-align:center; }
  .sig-title { font-family:'Cairo',sans-serif; font-weight:700; color:#2c3e50; margin-bottom:40px; }
  .sig-line { border-top:1px dashed #2c3e50; margin-top:20px; padding-top:10px; }
  .border-box { border:10px solid #2c3e50; border-radius:10px; padding:30px; min-height:1043px; }
</style>
</head>
<body>
  <div class="border-box">
    <div class="header">
      <div class="doc-title">عقد ${data.agreementTopic || 'اتفاق'}</div>
      <div class="date-text">إنه في يوم الموافق: <strong>${data.date || '___/___/_____'}</strong> تم الاتفاق بين كل من:</div>
    </div>
    
    <div class="intro">
      <p>1- <strong>الطرف الأول:</strong> <span class="party-name">${data.party1Name || '__________________'}</span>، هوية رقم: <span>${data.party1Id || '__________'}</span>.</p>
      <p>2- <strong>الطرف الثاني:</strong> <span class="party-name">${data.party2Name || '__________________'}</span>، هوية رقم: <span>${data.party2Id || '__________'}</span>.</p>
      <p>حيث أقر الطرفان بأهليتهما القانونية للتعاقد واتفقا على ما يلي:</p>
    </div>

    <div class="section-title">البند الأول: موضوع العقد</div>
    <div class="content-text">يلتزم الطرفان بموضوع هذا العقد وهو <strong>${data.agreementTopic || '_________________'}</strong> ووفقاً للبنود المذكورة أدناه.</div>
    
    <div class="section-title">البند الثاني: البنود التفصيلية</div>
    <div class="content-text">${data.terms || '...'}</div>
    
    <div class="section-title">البند الثالث: مدة العقد والقيمة</div>
    <div class="content-text">
       تبلغ مدة هذا العقد: <strong>${data.duration || '__________________'}</strong>. <br/>
       ${data.amount ? `القيمة المالية المتفق عليها: <strong>${data.amount}</strong>.` : ''}
    </div>

    <div class="signatures">
      <div class="sig-block">
        <div class="sig-title">الطرف الأول</div>
        <div>${data.party1Name || ''}</div>
        <div class="sig-line">التوقيع</div>
      </div>
      <div class="sig-block">
        <div class="sig-title">الطرف الثاني</div>
        <div>${data.party2Name || ''}</div>
        <div class="sig-line">التوقيع</div>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'official-letter',
    name: 'خطاب رسمي',
    category: 'إداري',
    description: 'خطابات التوجيه والمراسلات الرسمية',
    color: '#006747',
    accentColor: '#c8a951',
    icon: '✉️',
    fields: [
      { key: 'orgName', label: 'الجهة المصدرة', type: 'text', required: true },
      { key: 'date', label: 'التاريخ', type: 'date', required: true },
      { key: 'refNum', label: 'رقم الإشارة', type: 'text', required: false },
      { key: 'addressedTo', label: 'الموجه إليه (مع اللقب)', type: 'text', required: true },
      { key: 'subject', label: 'الموضوع', type: 'text', required: true },
      { key: 'greeting', label: 'التحية الافتتاحية', type: 'text', required: true },
      { key: 'body', label: 'نص الخطاب', type: 'textarea', required: true },
      { key: 'closing', label: 'التحية الختامية', type: 'text', required: true },
      { key: 'senderName', label: 'المرسل', type: 'text', required: true },
      { key: 'senderTitle', label: 'منصب المرسل', type: 'text', required: true }
    ],
    getHTML: (data) => `
<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Tajawal:wght@400;500;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:794px; min-height:1123px; font-family:'Tajawal',sans-serif; background:#fff; direction:rtl; padding:50px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #006747; padding-bottom:20px; margin-bottom:40px; }
  .org-info { text-align:right;}
  .meta-info { text-align:left; font-size:13px; color:#555; line-height:1.8; }
  .org-name { font-family:'Cairo',sans-serif; font-size:22px; font-weight:700; color:#006747; }
  .to-section { margin-bottom:30px; }
  .addressed-to { font-family:'Cairo',sans-serif; font-weight:700; font-size:18px; color:#333; }
  .subject { font-weight:700; text-decoration:underline; margin:20px 0; text-align:center; font-size:18px; color:#006747; }
  .greeting { margin-bottom:20px; font-weight:700; }
  .body-text { line-height:2.2; font-size:16px; text-align:justify; margin-bottom:30px; white-space:pre-wrap; color:#111; }
  .closing { margin-bottom:60px; font-weight:700; }
  .sender-block { text-align:left; padding-left:40px; }
  .sender-name { font-family:'Cairo',sans-serif; font-weight:700; font-size:18px; color:#006747; }
  .sender-title { font-size:14px; color:#555; }
  .footer-deco { position:absolute; bottom:50px; left:50px; right:50px; height:6px; background:linear-gradient(90deg, #006747, #c8a951); border-radius:3px; }
</style>
</head>
<body style="position:relative;">
  <div class="header">
    <div class="org-info">
      <div class="org-name">${data.orgName || 'الجهة المصدرة'}</div>
    </div>
    <div class="meta-info">
      <div>التاريخ: <strong>${data.date || '___/___/___'}</strong></div>
      ${data.refNum ? `<div>إشارة رقم: <strong>${data.refNum}</strong></div>` : ''}
    </div>
  </div>

  <div class="to-section">
    <div class="addressed-to">${data.addressedTo || 'المكرم / _____________________ الموقر'}</div>
    <div>السلام عليكم ورحمة الله وبركاته، وبعد..</div>
  </div>

  <div class="subject">الموضوع: ${data.subject || '______________________'}</div>

  <div class="greeting">${data.greeting || 'إشارة إلى الموضوع أعلاه،'}</div>

  <div class="body-text">${data.body || 'نص الخطاب هنا...'}</div>

  <div class="closing">${data.closing || 'وتقبلوا خالص التحية والتقدير،'}</div>

  <div class="sender-block">
    <div class="sender-name">${data.senderName || 'اسم المرسل'}</div>
    <div class="sender-title">${data.senderTitle || 'المنصب'}</div>
    <div style="margin-top:20px; border-top:1px solid #ccc; width:150px; padding-top:5px; margin-right:auto; margin-left:0; text-align:center; font-size:12px; color:#999;">التوقيع / الختم</div>
  </div>
  
  <div class="footer-deco"></div>
</body>
</html>`
  },
  {
    id: 'internal-memo',
    name: 'مذكرة داخلية',
    category: 'إداري',
    description: 'تواصل إداري داخل المنظمة',
    color: '#e67e22',
    accentColor: '#f39c12',
    icon: '📝',
    fields: [
      { key: 'from', label: 'من (الجهة/الشخص)', type: 'text', required: true },
      { key: 'to', label: 'إلى (الجهة/الشخص)', type: 'text', required: true },
      { key: 'date', label: 'التاريخ', type: 'date', required: true },
      { key: 'ref', label: 'رقم المرجع', type: 'text', required: false },
      { key: 'subject', label: 'الموضوع', type: 'text', required: true },
      { key: 'content', label: 'البيان والتفاصيل', type: 'textarea', required: true },
      { key: 'actionRequired', label: 'الإجراء المطلوب (إن وجد)', type: 'textarea', required: false },
      { key: 'senderName', label: 'الاسم والتوقيع', type: 'text', required: true }
    ],
    getHTML: (data) => `
<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Tajawal:wght@400;500;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:794px; min-height:1123px; font-family:'Tajawal',sans-serif; background:#fff; direction:rtl; }
  .top-bar { height:15px; background:linear-gradient(90deg, #e67e22, #f39c12); }
  .content-wrapper { padding:50px; }
  .memo-title { font-family:'Cairo',sans-serif; font-size:28px; font-weight:900; color:#e67e22; text-align:center; margin-bottom:40px; letter-spacing:1px; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:40px; background:#fdf8f5; padding:20px; border-radius:8px; border:1px solid #f39c12; }
  .info-item { display:flex; align-items:center; }
  .info-label { font-weight:700; width:100px; color:#d35400; }
  .info-value { font-weight:500; color:#333; }
  .subject-line { background:#e67e22; color:white; padding:12px 20px; font-family:'Cairo',sans-serif; font-size:18px; font-weight:700; border-radius:4px; margin-bottom:30px; display:flex; }
  .subject-label { width:100px; }
  .body-content { font-size:15px; line-height:2.2; color:#222; margin-bottom:40px; white-space:pre-wrap; }
  .action-box { background:#fff3e0; border-right:4px solid #e67e22; padding:15px 20px; margin-bottom:40px; }
  .action-title { font-weight:700; color:#d35400; margin-bottom:10px; }
  .signature { text-align:left; margin-top:50px; }
  .sig-name { font-family:'Cairo',sans-serif; font-weight:700; font-size:16px; color:#333; }
</style>
</head>
<body>
  <div class="top-bar"></div>
  <div class="content-wrapper">
    <div class="memo-title">مذكرة داخلية (MEMO)</div>
    
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">إلى:</div>
        <div class="info-value">${data.to || '________________'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">التاريخ:</div>
        <div class="info-value">${data.date || '___/___/___'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">من:</div>
        <div class="info-value">${data.from || '________________'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">المرجع:</div>
        <div class="info-value">${data.ref || '---'}</div>
      </div>
    </div>

    <div class="subject-line">
      <div class="subject-label">الموضوع:</div>
      <div>${data.subject || '______________________'}</div>
    </div>

    <div class="body-content">${data.content || 'التفاصيل هنا...'}</div>

    ${data.actionRequired ? `
    <div class="action-box">
      <div class="action-title">الإجراء المطلوب:</div>
      <div style="line-height:1.8; font-size:14px; white-space:pre-wrap;">${data.actionRequired}</div>
    </div>` : ''}

    <div class="signature">
      <div class="sig-name">${data.senderName || 'الاسم'}</div>
      <div style="margin-top:10px; font-size:13px; color:#777;">التوقيع: ________________</div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'resume',
    name: 'سيرة ذاتية',
    category: 'شخصي',
    description: 'سيرة ذاتية نقية عمودان',
    color: '#6c3483',
    accentColor: '#a569bd',
    icon: '👤',
    fields: [
      { key: 'name', label: 'الاسم الكامل', type: 'text', required: true },
      { key: 'title', label: 'المسمى المهني', type: 'text', required: true },
      { key: 'phone', label: 'رقم الهاتف', type: 'text', required: true },
      { key: 'email', label: 'البريد الإلكتروني', type: 'text', required: true },
      { key: 'address', label: 'العنوان', type: 'text', required: false },
      { key: 'summary', label: 'النبذة الشحصية', type: 'textarea', required: true },
      { key: 'experience', label: 'الخبرات المهنية (سنة - منصب - شركة - مهام)', type: 'textarea', required: true },
      { key: 'education', label: 'التعليم الأكاديمي', type: 'textarea', required: true },
      { key: 'skills', label: 'المهارات (مفصولة بفاصلة)', type: 'textarea', required: true }
    ],
    getHTML: (data) => `
<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Tajawal:wght@400;500;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:794px; min-height:1123px; font-family:'Tajawal',sans-serif; background:#fff; direction:rtl; display:flex; }
  .sidebar { width:260px; background:#f4f0f7; padding:40px 20px; border-left:1px solid #e1d5e7; display:flex; flex-direction:column; gap:30px; }
  .main-content { flex:1; padding:40px; background:#ffffff; }
  .name { font-family:'Cairo',sans-serif; font-size:28px; font-weight:900; color:#6c3483; line-height:1.2; margin-bottom:5px; }
  .job-title { font-size:16px; color:#a569bd; font-weight:700; margin-bottom:30px; }
  .contact-item { font-size:13px; color:#444; margin-bottom:10px; display:flex; align-items:center; gap:8px; word-break:break-word; }
  .section-title { font-family:'Cairo',sans-serif; font-size:18px; font-weight:700; color:#6c3483; border-bottom:2px solid #a569bd; padding-bottom:5px; margin-bottom:15px; }
  .sidebar .section-title { font-size:16px; }
  .text-content { font-size:14px; line-height:1.8; color:#333; white-space:pre-wrap; }
  .skills-list { display:flex; flex-wrap:wrap; gap:8px; }
  .skill-badge { background:#6c3483; color:white; font-size:12px; padding:4px 10px; border-radius:20px; }
  .exp-block { margin-bottom:20px; }
</style>
</head>
<body>
  <div class="sidebar">
    <div>
      <div class="name">${data.name || 'اسمك الكامل'}</div>
      <div class="job-title">${data.title || 'المسمى الوظيفي'}</div>
    </div>
    
    <div>
      <div class="section-title">معلومات الاتصال</div>
      <div class="contact-item">📞 ${data.phone || '000000000'}</div>
      <div class="contact-item">✉️ ${data.email || 'email@example.com'}</div>
      ${data.address ? `<div class="contact-item">📍 ${data.address}</div>` : ''}
    </div>

    <div>
      <div class="section-title">المهارات</div>
      <div class="skills-list">
        ${(data.skills || 'مهارة 1, مهارة 2').split(',').map(s => `<span class="skill-badge">${s.trim()}</span>`).join('')}
      </div>
    </div>
  </div>
  
  <div class="main-content">
    <div style="margin-bottom:35px;">
      <div class="section-title">النبذة الشخصية</div>
      <div class="text-content">${data.summary || 'اكتب نبذة عنك...'}</div>
    </div>

    <div style="margin-bottom:35px;">
      <div class="section-title">الخبرات المهنية</div>
      <div class="text-content">${data.experience || 'خبراتك وتفاصيلها...'}</div>
    </div>

    <div>
      <div class="section-title">التعليم الأكاديمي</div>
      <div class="text-content">${data.education || 'مؤهلاتك العلمية...'}</div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'project-plan',
    name: 'خطة مشروع',
    category: 'إداري',
    description: 'وثيقة تخطيط وتسليم المشاريع',
    color: '#16213e',
    accentColor: '#e94560',
    icon: '🎯',
    fields: [
      { key: 'projectName', label: 'اسم المشروع', type: 'text', required: true },
      { key: 'manager', label: 'مدير المشروع', type: 'text', required: true },
      { key: 'startDate', label: 'تاريخ البدء', type: 'date', required: true },
      { key: 'endDate', label: 'تاريخ الانتهاء المتوقع', type: 'date', required: true },
      { key: 'objectives', label: 'أهداف المشروع', type: 'textarea', required: true },
      { key: 'scope', label: 'نطاق العمل', type: 'textarea', required: true },
      { key: 'timeline', label: 'الجدول الزمني / المراحل', type: 'textarea', required: true },
      { key: 'resources', label: 'الموارد المطلوبة والميزانية', type: 'textarea', required: true }
    ],
    getHTML: (data) => `
<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Tajawal:wght@400;500;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:794px; min-height:1123px; font-family:'Tajawal',sans-serif; background:#fff; direction:rtl; }
  .header { background:#16213e; color:white; padding:40px; text-align:center; position:relative; }
  .header::after { content:""; position:absolute; bottom:0; left:0; width:100%; height:5px; background:#e94560; }
  .proj-title { font-family:'Cairo',sans-serif; font-size:32px; font-weight:900; margin-bottom:10px; }
  .badge { background:#e94560; color:white; font-size:14px; padding:4px 12px; border-radius:20px; display:inline-block; }
  .overview { display:grid; grid-template-columns:1fr 1fr 1fr; background:#f4f4f4; padding:20px 40px; border-bottom:1px solid #ddd; }
  .ov-item { padding:10px; border-right:2px solid #e94560; }
  .ov-label { font-size:12px; color:#666; font-weight:700; }
  .ov-value { font-size:15px; color:#16213e; font-weight:700; margin-top:4px; }
  .main { padding:40px; display:flex; flex-direction:column; gap:30px; }
  .box { border:1px solid #eee; border-radius:6px; padding:20px; box-shadow:0 2px 4px rgba(0,0,0,0.02); }
  .box-title { font-family:'Cairo',sans-serif; font-size:18px; font-weight:700; color:#16213e; margin-bottom:15px; display:flex; align-items:center; gap:8px; }
  .box-title::before { content:""; display:inline-block; width:12px; height:12px; background:#e94560; border-radius:50%; }
  .content-text { white-space:pre-wrap; font-size:14px; line-height:1.9; color:#444; }
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
</style>
</head>
<body>
  <div class="header">
    <div class="badge">وثيقة خطة المشروع</div>
    <div class="proj-title">${data.projectName || 'اسم المشروع'}</div>
  </div>
  
  <div class="overview">
    <div class="ov-item" style="border-right:none">
      <div class="ov-label">مدير المشروع</div>
      <div class="ov-value">${data.manager || '---'}</div>
    </div>
    <div class="ov-item">
      <div class="ov-label">تاريخ البدء</div>
      <div class="ov-value">${data.startDate || '---'}</div>
    </div>
    <div class="ov-item">
      <div class="ov-label">تاريخ الانتهاء</div>
      <div class="ov-value">${data.endDate || '---'}</div>
    </div>
  </div>

  <div class="main">
    <div class="box">
      <div class="box-title">الأهداف والرؤية</div>
      <div class="content-text">${data.objectives || 'تفاصيل...'}</div>
    </div>

    <div class="box">
      <div class="box-title">نطاق العمل (Scope)</div>
      <div class="content-text">${data.scope || 'تفاصيل...'}</div>
    </div>

    <div class="grid-2">
      <div class="box">
        <div class="box-title">الجدول الزمني والمراحل</div>
        <div class="content-text">${data.timeline || 'تفاصيل...'}</div>
      </div>
      <div class="box">
        <div class="box-title">الموارد والميزانية</div>
        <div class="content-text">${data.resources || 'تفاصيل...'}</div>
      </div>
    </div>
  </div>
</body>
</html>`
  }
];
