
import { GoogleGenAI, Modality } from "@google/genai";
import { FileData } from "../types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async <T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error.status || (error.response ? error.response.status : null);
      if (status === 429 || (status && status >= 500)) {
        const waitTime = Math.pow(2, attempt) * 1000;
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

export const getGeminiResponse = async (
  userMessage: string, 
  history: { role: 'user' | 'assistant', content: string }[],
  attachment?: FileData
) => {
  // Use strictly the required initialization pattern
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  return withRetry(async () => {
    // Process history: ensure strictly alternating user/model turns and single text parts
    const contents: any[] = [];
    
    history.forEach((h) => {
      const role = h.role === 'assistant' ? 'model' : 'user';
      const text = (h.content || "").trim();
      if (!text) return; // Skip empty messages in history

      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        // Concatenate text instead of adding multiple parts for same role
        contents[contents.length - 1].parts[0].text += "\n\n" + text;
      } else {
        contents.push({
          role,
          parts: [{ text }]
        });
      }
    });

    // Construct the current turn
    const currentParts: any[] = [];
    
    // Add text first if it exists
    if (userMessage.trim()) {
      currentParts.push({ text: userMessage });
    } else if (!attachment) {
      // Fallback if somehow both are missing
      currentParts.push({ text: "Please continue with the analysis." });
    }

    // Add image if provided
    if (attachment) {
      currentParts.push({
        inlineData: {
          data: attachment.data,
          mimeType: attachment.mimeType
        }
      });
    }

    // Check if we need to append currentParts to the last turn or create a new one
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts.push(...currentParts);
    } else {
      contents.push({ role: 'user', parts: currentParts });
    }

    // Ensure the conversation starts with a user turn (API requirement)
    if (contents.length > 0 && contents[0].role !== 'user') {
      contents.shift(); // Remove the leading model turn if it exists
    }

    try {
      // Use gemini-3-pro-preview for complex reasoning tasks like "Mastery Engine"
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents,
        config: {
          systemInstruction: `You are Mastery Engine, a world-class conceptual architect. 
          
          STRICT OPERATING PROTOCOL:
          Prioritize the underlying CONCEPT before providing specific answers. Deconstruct complexity into first principles and foundational logic.

          STRICT RESPONSE STRUCTURE:
          1. THE CORE PRINCIPLE
          [A deep, authoritative paragraph on the foundational logic or "why" behind the subject.]

          2. MENTAL MODEL (ANALOGY)
          [A vivid analogy that bridges abstract logic to a concrete experience.]

          3. THE DIRECT ANSWER
          [Address the specific query with technical precision.]

          4. CONCEPT MAP
          [Provide a VALID Mermaid flowchart TD. Start with 'flowchart TD' on its own line. Use standard --> for arrows. Wrap labels in quotes.]

          VISUAL STYLE:
          - Use standard sentence case.
          - Double line breaks between sections.
          - Plain text only (no bold/italics unless essential).

          DEEP_LEARNING_TOPICS: [List 3 related advanced topics separated by commas]`,
          temperature: 0.7,
        },
      });

      if (!response || !response.text) {
        throw new Error("Empty response from the neural gateway.");
      }

      return response.text.trim();
    } catch (apiError: any) {
      console.error("Gemini API Deep Error Log:", {
        message: apiError.message,
        status: apiError.status,
        details: apiError.details
      });
      throw apiError;
    }
  });
};

export const getGeminiTTS = async (text: string, voiceName: string = 'Kore') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const prepareSpeechText = (text: string): string => {
  return text
    .replace(/DEEP_LEARNING_TOPICS[\s\S]*?$/g, '')
    .replace(/flowchart[\s\S]*?$/gi, '')
    .replace(/graph[\s\S]*?$/gi, '')
    .replace(/[0-9]\.\s[A-Z\s]+/g, '') 
    .trim();
};
