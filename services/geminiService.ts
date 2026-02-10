import { GoogleGenAI } from "@google/genai";
import { DayLog } from "../types";

const API_KEY = process.env.API_KEY || '';

export const getMentorFeedback = async (log: DayLog): Promise<string> => {
  if (!API_KEY) return "Mentorship offline (API Key missing).";

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `
      Act as a quiet, stoic, strict but supportive mentor.
      Context: User is a pharmacy student and coder. High stress, exams near.
      They just finished their day.
      
      Data:
      - Deep Work: ${log.deepWorkMinutes} mins
      - Phone Violations: ${log.phoneViolations}
      - Sleep Time: ${log.sleepTime || 'Not set'} (Target: < 00:30)
      - Reflection - Right: ${log.reflection.whatWentRight}
      - Reflection - Distraction: ${log.reflection.distractionWin}
      - Reflection - Fix: ${log.reflection.fixForTomorrow}

      Task: Provide ONE single, short, impactful sentence of advice for tomorrow. 
      Do not be cheerful. Be grounding.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Focus on the process, not the noise.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Review your day. Silence is your friend.";
  }
};