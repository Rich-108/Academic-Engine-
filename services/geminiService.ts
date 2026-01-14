
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  return withRetry(async () => {
    const contents: any[] = [];
    
    // Process history: ensure strictly alternating user/model turns
    history.forEach((h) => {
      const role = h.role === 'assistant' ? 'model' : 'user';
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        // Merge consecutive same-role parts
        contents[contents.length - 1].parts.push({ text: h.content || "" });
      } else {
        contents.push({
          role,
          parts: [{ text: h.content || "" }]
        });
      }
    });

    const currentParts: any[] = [{ text: userMessage || "Provide analysis." }];

    if (attachment) {
      currentParts.push({
        inlineData: {
          data: attachment.data,
          mimeType: attachment.mimeType
        }
      });
    }

    // Ensure the conversation starts with 'user' and alternates
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts.push(...currentParts);
    } else {
      contents.push({ role: 'user', parts: currentParts });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction: `You are Mastery Engine, a world-class conceptual architect for students. 
          
          STRICT OPERATING PROTOCOL:
          Prioritize the underlying CONCEPT before specific answers. Deconstruct complexity into first principles and logic.

          STRICT RESPONSE STRUCTURE:
          1. THE CORE PRINCIPLE
          [Deep paragraph on foundational logic.]

          2. MENTAL MODEL (ANALOGY)
          [Vivid everyday analogy.]

          3. THE DIRECT ANSWER
          [Technical precision addressing the specific query.]

          4. CONCEPT MAP
          [Provide a VALID Mermaid flowchart TD.
          
          CRITICAL MERMAID RULES:
          - Always start with 'flowchart TD' on its own line.
          - Every node MUST have an alphanumeric ID.
          - Use standard "-->" for connections.
          - Example format:
            flowchart TD
            A["Core Concept"] --> B["Sub-concept"]
            B --> C["Detail"]
          - DO NOT output the chart and header on the same line.]

          VISUAL STYLE:
          - Use standard sentence case.
          - Double line breaks between sections.
          - No markdown symbols except for the Mermaid block.

          DEEP_LEARNING_TOPICS: [List 3 related topics]`,
          temperature: 0.7,
        },
      });

      if (!response || !response.text) {
        throw new Error("Empty response from engine.");
      }

      return response.text.trim();
    } catch (apiError: any) {
      console.error("Gemini API Error:", apiError);
      throw apiError;
    }
  });
};

export const getGeminiTTS = async (text: string, voiceName: string = 'Kore') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
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
