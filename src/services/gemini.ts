import { GoogleGenAI, type Chat, type GenerateContentResponse } from '@google/genai';
import type { GeminiModel, DeepAnalysis } from '@/types';
import { TEXT_LIMITS, PROMPTS, ERROR_MESSAGES, GEMINI_MODELS } from '@/config/constants';

/**
 * Create a Gemini client with the provided API key
 */
function getClient(apiKey: string): GoogleGenAI {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(ERROR_MESSAGES.GEMINI_KEY_REQUIRED);
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Truncate text to stay within token limits
 */
function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  return text.substring(0, maxChars) + '\n\n[... Text wurde bei ' + maxChars.toLocaleString('de-DE') + ' Zeichen gekürzt ...]';
}

/**
 * Extract thinking/thoughts from Gemini response
 */
function extractThoughts(response: GenerateContentResponse): string | undefined {
  try {
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      const thoughtPart = candidate.content.parts.find(
        (p: { thought?: boolean }) => 'thought' in p && p.thought === true
      );
      if (thoughtPart && 'text' in thoughtPart) {
        return thoughtPart.text as string;
      }
    }
  } catch {
    // Ignore errors in thought extraction
  }
  return undefined;
}

/**
 * Generate a fast summary using Gemini Flash
 */
export async function generateSummary(
  text: string,
  apiKey: string,
  model: GeminiModel = 'gemini-2.5-flash'
): Promise<string> {
  const client = getClient(apiKey);
  const truncatedText = truncateText(text, TEXT_LIMITS.SUMMARY_MAX_CHARS);

  const prompt = `${PROMPTS.SUMMARY}

Protokolltext:
${truncatedText}`;

  try {
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    return response.text || 'Keine Zusammenfassung generiert.';
  } catch (error) {
    console.error('Gemini Summary Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Ungültiger Gemini API-Key. Bitte überprüfen Sie Ihre Einstellungen.');
      }
      if (error.message.includes('quota')) {
        throw new Error('API-Kontingent erschöpft. Bitte versuchen Sie es später erneut.');
      }
      throw new Error(`Zusammenfassung fehlgeschlagen: ${error.message}`);
    }
    throw new Error(ERROR_MESSAGES.ANALYSIS_FAILED);
  }
}

/**
 * Generate deep analysis using Gemini Pro with thinking capabilities
 */
export async function generateDeepAnalysis(
  text: string,
  apiKey: string,
  model: GeminiModel = 'gemini-2.5-pro',
  thinkingBudget = 4096
): Promise<DeepAnalysis> {
  const client = getClient(apiKey);
  const modelConfig = GEMINI_MODELS[model];
  const truncatedText = truncateText(text, TEXT_LIMITS.ANALYSIS_MAX_CHARS);

  const prompt = `${PROMPTS.DEEP_ANALYSIS}

Protokolltext:
${truncatedText}`;

  try {
    const config: Record<string, unknown> = {
      temperature: 0.2,
      maxOutputTokens: 8192,
    };

    // Add thinking config if model supports it
    if (modelConfig.supportsThinking) {
      config.thinkingConfig = {
        includeThoughts: true,
        thinkingBudget: thinkingBudget,
      };
    }

    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config,
    });

    const thoughts = modelConfig.supportsThinking ? extractThoughts(response) : undefined;

    return {
      text: response.text || 'Keine Analyse generiert.',
      thoughts,
    };
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Ungültiger Gemini API-Key. Bitte überprüfen Sie Ihre Einstellungen.');
      }
      if (error.message.includes('quota')) {
        throw new Error('API-Kontingent erschöpft. Bitte versuchen Sie es später erneut.');
      }
      if (error.message.includes('503') || error.message.includes('overloaded')) {
        throw new Error('Gemini ist derzeit überlastet. Bitte versuchen Sie es in einigen Minuten erneut.');
      }
      throw new Error(`Analyse fehlgeschlagen: ${error.message}`);
    }
    throw new Error(ERROR_MESSAGES.ANALYSIS_FAILED);
  }
}

/**
 * Create a chat session for the investigator mode
 */
export async function createChatSession(
  protocolText: string,
  apiKey: string,
  model: GeminiModel = 'gemini-2.5-pro',
  thinkingBudget = 4096
): Promise<Chat> {
  const client = getClient(apiKey);
  const modelConfig = GEMINI_MODELS[model];
  const truncatedText = truncateText(protocolText, TEXT_LIMITS.CHAT_CONTEXT_CHARS);

  const systemInstruction = `${PROMPTS.CHAT_SYSTEM}

Hier ist das vollständige Protokoll, das du analysieren sollst:

${truncatedText}`;

  const config: Record<string, unknown> = {
    systemInstruction,
    temperature: 0.4,
    maxOutputTokens: 4096,
  };

  // Add thinking config if model supports it
  if (modelConfig.supportsThinking) {
    config.thinkingConfig = {
      includeThoughts: true,
      thinkingBudget: thinkingBudget,
    };
  }

  const chat = client.chats.create({
    model,
    config,
  });

  return chat;
}

/**
 * Send a message in an existing chat session
 */
export async function sendChatMessage(
  chat: Chat,
  message: string,
  supportsThinking = true
): Promise<{ text: string; thoughts?: string }> {
  try {
    const response = await chat.sendMessage({ message });

    const thoughts = supportsThinking ? extractThoughts(response) : undefined;

    return {
      text: response.text || 'Keine Antwort erhalten.',
      thoughts,
    };
  } catch (error) {
    console.error('Chat Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('503') || error.message.includes('overloaded')) {
        throw new Error('Gemini ist derzeit überlastet. Bitte versuchen Sie es erneut.');
      }
      throw new Error(`Chat-Fehler: ${error.message}`);
    }
    throw new Error('Nachricht konnte nicht gesendet werden.');
  }
}

/**
 * Validate Gemini API key
 */
export async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    const client = getClient(apiKey);
    await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Test',
      config: { maxOutputTokens: 10 },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get available Gemini models
 */
export function getAvailableModels() {
  return Object.values(GEMINI_MODELS);
}
