import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('GEMINI_API_KEY غير موجود في متغيرات البيئة');
      return NextResponse.json(
        { error: 'الخدمة غير متاحة حالياً' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      prompt,
      history = [],
      model: modelName = 'gemini-1.5-flash',
      systemInstruction,
      images = [],
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'الـ prompt مطلوب' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      ...(systemInstruction && { systemInstruction }),
    });

    let responseText = '';

    if (images && images.length > 0) {
      // Vision model request
      const parts = [{ text: prompt }];
      images.forEach(img => {
        parts.push({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType
          }
        });
      });
      const result = await model.generateContent(parts);
      responseText = result.response.text();
    } else if (history.length > 0) {
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(prompt);
      responseText = result.response.text();
    } else {
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    }

    return NextResponse.json({
      text: responseText,
      success: true,
    });

  } catch (error) {
    console.error('Gemini Error:', error?.message);

    const message = error?.message || '';

    if (message.includes('API_KEY_INVALID') ||
        message.includes('API key')) {
      return NextResponse.json(
        { error: 'مشكلة في إعدادات الخدمة' },
        { status: 401 }
      );
    }

    if (message.includes('RESOURCE_EXHAUSTED') ||
        message.includes('quota')) {
      return NextResponse.json(
        { error: 'تم تجاوز حد الاستخدام، حاول لاحقاً' },
        { status: 429 }
      );
    }

    if (message.includes('SAFETY')) {
      return NextResponse.json(
        { error: 'تم حجب المحتوى لأسباب أمنية' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع' },
      { status: 500 }
    );
  }
}
