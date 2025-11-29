import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeWebtoonPage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const ai = getGeminiClient();
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        systemInstruction: "You are an expert manga and webtoon assistant. You help users understand the story, translate text, and analyze the art style of vertical scroll comics. Keep answers concise and helpful."
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to analyze the image. Please try again.";
  }
};