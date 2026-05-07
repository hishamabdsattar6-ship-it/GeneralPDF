import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API route for Gemini
  app.post("/api/gemini", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.error("GEMINI_API_KEY is missing");
        return res.status(503).json({ error: "الخدمة غير متاحة حالياً" });
      }

      const { prompt, history = [], model: modelName = "gemini-1.5-flash", systemInstruction, images = [] } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "الـ prompt مطلوب" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        ...(systemInstruction && { systemInstruction }),
      });

      let responseText = "";

      if (images && images.length > 0) {
        const parts: any[] = [{ text: prompt }];
        images.forEach((img: any) => {
          parts.push({
            inlineData: {
              data: img.data,
              mimeType: img.mimeType,
            },
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

      return res.json({ text: responseText, success: true });
    } catch (error: any) {
      console.error("Gemini Error:", error?.message);

      const message = error?.message || "";

      if (message.includes("API_KEY_INVALID") || message.includes("API key")) {
        return res.status(401).json({ error: "مشكلة في إعدادات الخدمة" });
      }
      if (message.includes("RESOURCE_EXHAUSTED") || message.includes("quota")) {
        return res.status(429).json({ error: "تم تجاوز حد الاستخدام، حاول لاحقاً" });
      }
      if (message.includes("SAFETY")) {
        return res.status(400).json({ error: "تم حجب المحتوى لأسباب أمنية" });
      }

      return res.status(500).json({ error: "حدث خطأ غير متوقع" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
