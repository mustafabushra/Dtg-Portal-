
import { GoogleGenAI } from "@google/genai";

export const getCafeInsights = async (data: any) => {
  if (!process.env.API_KEY) return "النظام يحتاج لمفتاح API للتحليل الذكي.";

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `أنت مدير عمليات تشغيل مقاهي محترف. حلل هذه البيانات الواقعية للكافي:
      - المخزون: ${data.inventory.length} صنف.
      - الأصول: ${data.assets.length} معدة.
      - الموظفين: ${data.staff.length} موظف.
      - السيولة الحالية: ${data.treasuryTransactions.reduce((acc:any, t:any) => t.type === 'IN' ? acc + t.amount : acc - t.amount, 0)} ريال.
      
      المطلوب: قدم 3 توصيات تنفيذية قصيرة جداً لزيادة الربح أو تقليل الهدر باللغة العربية.`,
      config: { temperature: 0.6 }
    });
    return response.text;
  } catch (error) {
    return "تعذر الحصول على التحليل اللحظي حالياً.";
  }
};

export const chatWithAI = async (query: string, context: any) => {
  if (!process.env.API_KEY) return "المساعد الذكي غير مفعل.";
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بيانات النظام: ${JSON.stringify(context)}. سؤال المستخدم: ${query}`,
      config: {
        systemInstruction: "أنت المساعد الذكي لنظام كافي برو. أجب باختصار شديد، وبلهجة مهنية عربية. ركز على الحلول الإدارية."
      }
    });
    return response.text;
  } catch (error) {
    return "حدث خطأ في الاتصال بالمساعد.";
  }
};
