
import { onRequest } from "firebase-functions/v2/https";
import { GoogleGenAI } from "@google/genai";
import * as logger from "firebase-functions/logger";

const API_KEY = process.env.API_KEY;

export const gemini = onRequest({ cors: true }, async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const { prompt, context } = request.body;

    if (!API_KEY) {
      logger.error("API Key missing");
      response.status(500).json({ error: "Server configuration error (API Key)" });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context ? `Context: ${JSON.stringify(context)}\n\nPrompt: ${prompt}` : prompt,
    });

    response.status(200).json({ text: aiResponse.text });
  } catch (error: any) {
    logger.error("Gemini Error", error);
    response.status(500).json({ error: error.message });
  }
});
