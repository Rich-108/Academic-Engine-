
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { FileData } from "../types";

/**
 * Maps technical API errors to student-friendly academic feedback.
 */
const mapErrorToUserMessage = (error: any): string => {
  const errorMessage = error?.message?.toLowerCase() || "";
  
  if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
    return "The Engine is at maximum capacity after several attempts. Please pause for 10 seconds and try your inquiry again.";
  }
  if (errorMessage.includes("safety") || errorMessage.includes("blocked")) {
    return "This inquiry was filtered for academic safety. Please focus on subject exploration.";
  }
  if (errorMessage.includes("api key") || errorMessage.includes("invalid") || errorMessage.includes("401") || errorMessage.includes("403")) {
    return "Portal authorization failed. Please check your connection or API configuration.";
  }
  
  return "The Mastery Engine encountered a connectivity issue. Your session is preserved; please retry the last request.";
};

/**
 * Helper to sleep for a specific duration (ms)
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wraps a function with automatic retry logic using exponential backoff.
 * Specifically handles 429 (Rate Limit) and 500 (Server Error).
 */
const withRetry = async <T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error.message?.includes("429") || error.message?.toLowerCase().includes("rate limit");
      const isServerError = error.message?.includes("500") || error.message?.includes("503");

      if (isRateLimit || isServerError) {
        // Calculate wait time: 1s, 2s, 4s...
        const waitTime = Math.pow(2, attempt) * 1000;
        console.warn(`Mastery Engine: High load detected. Retrying in ${waitTime}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await sleep(waitTime);
        continue;
      }
      // If it's a non-retryable error (like safety or 401), throw immediately
      throw error;
    }
  }
  throw lastError;
};

const trimHistory = (history: { role: 'user' | 'model', parts: { text: string }[] }[], limit: number = 25) => {
  return history.length <= limit ? history : history.slice(-limit);
};

export const getGeminiResponse = async (
  userMessage: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  attachment?: FileData,
  modelName: string = 'gemini-3-flash-preview'
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  return withRetry(async () => {
    const userParts: any[] = [{ text: userMessage }];
    
    if (attachment) {
      userParts.push({
        inlineData: {
          data: attachment.data,
          mimeType: attachment.mimeType
        }
      });
    }

    const trimmedHistory = trimHistory(history);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...trimmedHistory,
        { role: 'user', parts: userParts }
      ],
      config: {
        systemInstruction: `You are Mastery Engine, a conceptual tutor.
        
        PEDAGOGICAL MANDATE:
        If a student asks a question about a subject, NEVER provide just the answer. 
        Instead, you MUST first explain the underlying CONCEPT and foundational principles.
        
        GREETING PROTOCOL:
        If the input is a greeting, respond with 1 warm sentence confirming your readiness to help.
        
        SUBJECT INQUIRY PROTOCOL:
        Use this structure for all academic topics:
        1. THE CORE PRINCIPLE: The logical "why" behind the topic.
        2. AN ANALOGY: Compare the concept to an everyday object or experience.
        3. THE APPLICATION: Walk through the solution or explanation step-by-step.
        4. CONCEPT MAP: If process-oriented, provide a Mermaid diagram.
        
        STYLING CONSTRAINTS:
        - NO markdown symbols like #, *, **, _, >.
        - USE ALL CAPS for the 4 section headers above.
        - Double line breaks between paragraphs.
        - End with: [RELATED_TOPICS: Topic A, Topic B, Topic C]`,
        temperature: 0.7,
      },
    });

    return response.text || "No response generated.";
  });
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  return withRetry(async () => {
    const cleanText = text
      .replace(/```mermaid[\s\S]*?```/g, '')
      .replace(/\[RELATED_TOPICS:[\s\S]*?\]/g, '')
      .replace(/[#*`]/g, '')
      .trim();

    if (!cleanText) return undefined;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }, 2); // Less retries for audio to prioritize speed
};
