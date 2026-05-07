import OpenAI from "openai";
import { askGemini } from "../lib/gemini-client";

type AIProvider = 'gemini' | 'openai';

class AIService {
  private openai: OpenAI | null = null;
  private provider: AIProvider = 'gemini';

  constructor() {
    this.initProviders();
  }

  private initProviders() {
    const env = (import.meta as any).env || {};
    const openaiKey = env.VITE_OPENAI_API_KEY || "";
    
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true });
    }

    this.provider = (env.VITE_AI_PROVIDER as AIProvider) || 'gemini';
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      const currentProvider = this.provider;
      const pdfSafeConstraint = "IMPORTANT: Do NOT use emojis, unusual unicode symbols, or custom icons. Only use standard numbers, standard Arabic/English characters, standard punctuation, and ASCII dash (-) for bullet points. This text will be rendered in a PDF with limited font fallback.";

      if (currentProvider === 'gemini') {
        const fullPrompt = context ? `Context: ${context}\n\nConstraint: ${pdfSafeConstraint}\n\nQuestion: ${prompt}` : `${pdfSafeConstraint}\n\nTask: ${prompt}`;
        const text = await askGemini({ prompt: fullPrompt });
        return text || "No response generated";
      } else {
        if (!this.openai) {
          throw new Error("OpenAI API key is not configured.");
        }
        const messages: any[] = [];
        if (context) messages.push({ role: 'system', content: context });
        messages.push({ role: 'user', content: prompt });

        const completion = await this.openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
        });
        return completion.choices[0].message.content || "No response generated";
      }
    } catch (error: any) {
      console.error("AI client error:", error);
      return `Error: ${error.message}`;
    }
  }

  async generateVisionResponse(prompt: string, images: { data: string, mimeType: string }[], context?: string): Promise<string> {
    try {
      const env = (import.meta as any).env || {};
      const currentProvider = (env.VITE_AI_PROVIDER as AIProvider) || 'gemini';
      const pdfSafeConstraint = "IMPORTANT: Do NOT use emojis, unusual unicode symbols, or custom icons. Only use standard numbers, standard Arabic/English characters, standard punctuation, and ASCII dash (-) for bullet points. This text will be rendered in a PDF with limited font fallback.";

      if (currentProvider === 'gemini') {
        const fullPrompt = context ? `Context: ${context}\n\nConstraint: ${pdfSafeConstraint}\n\nTask: ${prompt}` : `${pdfSafeConstraint}\n\nTask: ${prompt}`;
        const text = await askGemini({ prompt: fullPrompt, images });
        return text || "No response generated";
      } else {
        if (!this.openai) throw new Error("OpenAI API key is not configured.");
        
        const content: any[] = [{ type: 'text', text: context ? `Context: ${context}\n\nTask: ${prompt}` : prompt }];
        
        images.forEach(img => {
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:${img.mimeType};base64,${img.data}`
            }
          });
        });

        const completion = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: 'user', content }],
        });
        return completion.choices[0].message.content || "No response generated";
      }
    } catch (error: any) {
      console.error("AI client error (Vision):", error);
      return `Error: ${error.message}`;
    }
  }
}

export const aiService = new AIService();



