
import { GoogleGenAI } from "@google/genai";
import { Question } from "../types";

// NOTE: process.env.API_KEY is handled by the build environment/runtime.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Fire Sprinkler Fitter Instructor specializing in the Minnesota Journeyman Exam.
Your knowledge base covers NFPA 13, 13R, 13D, 14, 20, 24, and 25 (2016/2011 Editions primarily), as well as Minnesota Statutes Chapter 299M and Minnesota Rules 7512.

Role:
1. Explain answers clearly to a tradesperson. Avoid overly academic jargon.
2. Provide mnemonics (memory aids) whenever possible.
3. If the user asks about Minnesota Amendments, emphasize strict adherence to MN code (e.g., FDC height 18-48", valve supervision).
4. Be encouraging but strict about safety and code compliance.
5. ALWAYS explicitly reference the specific Code Section, Statute, or Rule number provided in the context (e.g., "As per NFPA 13 Section 8.15...").

Format:
Keep responses concise (under 150 words usually). Use markdown for bolding key terms.
`;

export const askTutor = async (userQuery: string, currentQuestion?: Question): Promise<string> => {
  try {
    let contextPrompt = "";
    
    if (currentQuestion) {
      contextPrompt = `
      Current Quiz Question Context:
      Topic: ${currentQuestion.topic} (${currentQuestion.category})
      System Type: ${currentQuestion.sprinklerType || 'General (N/A)'}
      Question: "${currentQuestion.question}"
      Correct Answer: "${currentQuestion.answer}"
      
      **Code Reference:**
      Citation: ${currentQuestion.citation}
      Specific Section/Rule: ${currentQuestion.citation}
      Code Text: "${currentQuestion.code_text}"
      ${currentQuestion.is_mn_amendment ? "**IMPORTANT: This is a MINNESOTA SPECIFIC AMENDMENT that overrides standard NFPA.**" : ""}
      
      User Question: "${userQuery}"
      `;
    } else {
      contextPrompt = `User Question: "${userQuery}"`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contextPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the code books right now. Please try again later.";
  }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string = 'audio/webm'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          { text: "Transcribe this audio exactly. Return only the text, no explanation." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    return ""; // Return empty string on error so UI can handle it
  }
};