import { GoogleGenAI, Type } from "@google/genai";

// Guideline: Use process.env.API_KEY directly when initializing the @google/genai client instance
export const evaluateCandidate = async (jdContent: string, resumeContent: string) => {
  // Guideline: Create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze this candidate's resume against the following Job Description (JD).
    
    JD Content:
    ${jdContent}
    
    Resume Content:
    ${resumeContent}
    
    Return a structured JSON evaluation including a match percentage (0-100), pros, cons, a summary, and 5 custom interview questions.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchPercentage: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["matchPercentage", "summary", "pros", "cons", "recommendedQuestions"],
      },
    },
  });

  // Guideline: The .text property directly returns the string output (not a method)
  return JSON.parse(response.text || '{}');
};

export const generateEmail = async (candidateName: string, jobTitle: string, score: number) => {
  // Guideline: Create a new GoogleGenAI instance right before making an API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Write a professional interview invitation email for ${candidateName} for the ${jobTitle} position. Their AI matching score was ${score}%. Keep it warm, professional, and clear.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  // Guideline: The .text property directly returns the string output (not a method)
  return response.text || '';
};