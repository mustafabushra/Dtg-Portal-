
import { GoogleGenAI } from "@google/genai";

// في Firebase Hosting، سنستخدم Rewrite لتوجيه /api/gemini إلى Cloud Function
const IS_PRODUCTION = window.location.hostname !== 'localhost';
const API_ENDPOINT = "/api/gemini";

export const getCafeInsights = async (data: any) => {
  if (IS_PRODUCTION) {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: "قدم 3 توصيات تنفيذية قصيرة جداً لزيادة الربح أو تقليل الهدر باللغة العربية.",
          context: {
            inventoryCount: data.inventory.length,
            staffCount: data.staff.length,
            balance: data.treasuryTransactions?.reduce((acc:any, t:any) => t.type === 'IN' ? acc + t.amount : acc - t.amount, 0) || 0
          }
        })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      return result.text;
    } catch (e) {
      console.error(e);
      return "خطأ في الاتصال بسيرفر التحليل (Firebase Function).";
    }
  }

  // البيئة المحلية (Local Development)
  if (!process.env.API_KEY) return "يحتاج النظام لمفتاح API في البيئة المحلية.";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `أنت مدير مقاهي محترف. حلل: المخزون ${data.inventory.length} صنف، السيولة ${data.treasuryTransactions?.length} عملية. قدم 3 نصائح سريعة بالعربية.`,
    });
    return response.text;
  } catch (error) {
    return "فشل التحليل المحلي.";
  }
};

export const chatWithAI = async (query: string, context: any) => {
  if (IS_PRODUCTION) {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: query, context })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      return result.text;
    } catch (e) {
      console.error(e);
      return "عذراً، المساعد غير متاح حالياً (Firebase Error).";
    }
  }

  if (!process.env.API_KEY) return "المساعد يحتاج لمفتاح API.";
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: ${JSON.stringify(context)}\nUser: ${query}`,
      config: {
        systemInstruction: "أنت مساعد إداري ذكي لنظام كافي برو. أجب باختصار شديد وباحترافية."
      }
    });
    return response.text;
  } catch (error) {
    return "حدث خطأ في معالجة طلبك.";
  }
};
