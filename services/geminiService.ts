
import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysis, HealthLabel, LanguageCode, SafetyLevel, SUPPORTED_LANGUAGES } from "../types";

export const analyzeFoodIngredients = async (
  input: string | { data: string; mimeType: string },
  isImage: boolean = false,
  languageCode: LanguageCode = 'en'
): Promise<FoodAnalysis> => {
  // Always initialize fresh to ensure API key is captured
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const langName = SUPPORTED_LANGUAGES.find(l => l.code === languageCode)?.name || 'English';

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            code: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["name", "category"]
        }
      },
      additives: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            purpose: { type: Type.STRING },
            safetyLevel: { type: Type.STRING, enum: Object.values(SafetyLevel) },
            sideEffects: { type: Type.STRING },
            regulatoryStatus: { type: Type.STRING }
          },
          required: ["name", "purpose", "safetyLevel", "sideEffects", "regulatoryStatus"]
        }
      },
      healthInsights: {
        type: Type.OBJECT,
        properties: {
          childrenFriendly: { type: Type.STRING },
          pregnancySafe: { type: Type.STRING },
          allergies: { type: Type.STRING },
          dietary: { type: Type.STRING }
        },
        required: ["childrenFriendly", "pregnancySafe", "allergies", "dietary"]
      },
      score: { type: Type.NUMBER },
      label: { type: Type.STRING, enum: Object.values(HealthLabel) },
      alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
      verdict: { type: Type.STRING }
    },
    required: ["ingredients", "additives", "healthInsights", "score", "label", "alternatives", "verdict"]
  };

  const systemInstruction = `You are a Food Safety & Nutrition Analysis AI specialized in identifying additives, preservatives, and health risks in food products.
Analyze the provided food ingredients and respond ONLY in the following language: ${langName}.
Guidelines:
1. Extract and normalize all ingredients (including E-numbers).
2. Classify them (Preservative, Artificial Color, Natural, etc.).
3. Assess risks based on global standards (FDA, EFSA, WHO).
4. Provide insights for kids, pregnancy, and common allergies.
5. Generate a health score (1-10) and a verdict.
6. Suggest healthier, real-food alternatives found in Indian markets if applicable.`;

  try {
    const contents = isImage && typeof input !== 'string' 
      ? { parts: [{ inlineData: input }, { text: `Analyze the ingredients label in this image and provide a detailed report in ${langName}.` }] }
      : { parts: [{ text: `Analyze these ingredients and provide a detailed report in ${langName}: ${input}` }] };

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2, // Lower temperature for more consistent JSON
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text.trim()) as FoodAnalysis;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};
