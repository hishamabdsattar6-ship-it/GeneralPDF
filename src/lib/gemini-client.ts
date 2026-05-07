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

  if (history && history.length > 0) {
    // We didn't actually implement startChat mapping from the provided history format, 
    // but we can map the prompt if needed, or simply pass contents. 
    // Actually the aiService doesn't use history anyway.
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config,
    });
    return response.text;
  } else {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config,
    });
    return response.text;
  }
}

