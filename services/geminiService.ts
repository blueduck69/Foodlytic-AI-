
import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysis, HealthLabel, SafetyLevel } from "../types";

export const analyzeFoodIngredients = async (
  input: string | { data: string; mimeType: string },
  isImage: boolean = false
): Promise<FoodAnalysis> => {
  // Use process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING, description: "Name of the product if detected" },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            code: { type: Type.STRING, description: "E-number if applicable" },
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
      score: { type: Type.NUMBER, description: "Score from 1 to 10" },
      label: { type: Type.STRING, enum: Object.values(HealthLabel) },
      alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
      verdict: { type: Type.STRING }
    },
    required: ["ingredients", "additives", "healthInsights", "score", "label", "alternatives", "verdict"]
  };

  const systemPrompt = `You are a Food Safety & Nutrition Analysis AI. Analyze the food ingredients provided.
  1. Extract and normalize all ingredients (including E-numbers).
  2. Classify them into categories like Preservative, Artificial Color, Natural, etc.
  3. Assess additive risks based on global standards (FDA, EFSA, WHO).
  4. Provide health insights for kids, pregnancy, and allergies.
  5. Generate a health score (1-10) and a verdict.
  6. Suggest healthier alternatives.
  Be informative, accurate, and consumer-friendly. Do not make medical diagnoses.`;

  const contents = isImage && typeof input !== 'string' 
    ? { parts: [{ inlineData: input }, { text: "Analyze the ingredients in this image." }] }
    : { parts: [{ text: `Analyze these ingredients: ${input}` }] };

  // Use gemini-3-pro-preview for complex reasoning tasks like safety analysis
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    },
  });

  return JSON.parse(response.text) as FoodAnalysis;
};
