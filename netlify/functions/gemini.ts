
import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  // منع طلبات غير الـ POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt, context } = JSON.parse(event.body);
    
    // جلب المفتاح من متغيرات بيئة نيتليفاي (التي ستضبطها في لوحة التحكم)
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "API Key missing on server" }) };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context ? `Context: ${JSON.stringify(context)}\n\nPrompt: ${prompt}` : prompt,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: response.text }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
