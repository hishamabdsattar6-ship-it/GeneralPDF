import { GoogleGenAI } from "@google/genai";

export async function askGemini({
  prompt,
  history = [],
  model = "gemini-3-flash-preview",
  systemInstruction = null,
  images = [],
}: {
  prompt: string;
  history?: any[];
  model?: string;
  systemInstruction?: string | null;
  images?: { data: string; mimeType: string }[];
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "AIzaSyDPu7fQZ2-GStYWTZWnEt-j9gEYLmRwjFg") {
    throw new Error("مشكلة في إعدادات الخدمة: مفتاح API غير صالح. تأكد من إضافة مفتاح صحيح في إعدادات Vercel أو حذف المفتاح الوهمي.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [];
  if (images && images.length > 0) {
    images.forEach((img) => {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType,
        },
      });
    });
  }
  parts.push({ text: prompt });

  const config: any = {};
  if (systemInstruction) config.systemInstruction = systemInstruction;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config,
    });
    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error?.message || error);
    if (error?.message?.includes("503") || error?.message?.includes("UNAVAILABLE") || error?.status === 503) {
      throw new Error("عذراً، يوجد ضغط كبير على خوادم الذكاء الاصطناعي حالياً (الخدمة غير متاحة مؤقتاً). يرجى المحاولة مرة أخرى بعد قليل.");
    }
    throw new Error(error?.message || "حدث خطأ أثناء التواصل مع نموذج الذكاء الاصطناعي.");
  }
}


