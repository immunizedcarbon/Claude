import { useState, useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { generateSummary, generateDeepAnalysis, createChatSession, sendChatMessage } from '@/services/gemini';
import type { Chat } from '@google/genai';
import type { ChatMessage } from '@/types';
import { GEMINI_MODELS } from '@/config/constants';

export function useAnalysis() {
  const apiKeys = useStore((state) => state.apiKeys);
  const settings = useStore((state) => state.settings);
  const selectedProtocol = useStore((state) => state.selectedProtocol);
  const analysisCache = useStore((state) => state.analysisCache);
  const updateAnalysisCache = useStore((state) => state.updateAnalysisCache);
  const chatMessages = useStore((state) => state.chatMessages);
  const addChatMessage = useStore((state) => state.addChatMessage);
  const clearChatMessages = useStore((state) => state.clearChatMessages);
  const updateLastMessage = useStore((state) => state.updateLastMessage);

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  const chatSessionRef = useRef<Chat | null>(null);
  const currentProtocolIdRef = useRef<string | null>(null);

  const currentAnalysis = selectedProtocol ? analysisCache[selectedProtocol.id] : null;

  const generateProtocolSummary = useCallback(async () => {
    if (!selectedProtocol || !apiKeys.geminiKey) return;

    setIsSummarizing(true);
    updateAnalysisCache(selectedProtocol.id, { status: 'loading' });

    try {
      const summary = await generateSummary(
        selectedProtocol.text,
        apiKeys.geminiKey,
        'gemini-2.5-flash' // Always use Flash for summaries (faster, cheaper)
      );

      updateAnalysisCache(selectedProtocol.id, {
        summary,
        status: 'completed',
      });
    } catch (error) {
      console.error('Summary error:', error);
      updateAnalysisCache(selectedProtocol.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Zusammenfassung fehlgeschlagen',
      });
    } finally {
      setIsSummarizing(false);
    }
  }, [selectedProtocol, apiKeys.geminiKey, updateAnalysisCache]);

  const generateProtocolAnalysis = useCallback(async () => {
    if (!selectedProtocol || !apiKeys.geminiKey) return;

    setIsAnalyzing(true);
    updateAnalysisCache(selectedProtocol.id, { status: 'loading' });

    try {
      const deepAnalysis = await generateDeepAnalysis(
        selectedProtocol.text,
        apiKeys.geminiKey,
        settings.geminiModel,
        settings.thinkingBudget
      );

      updateAnalysisCache(selectedProtocol.id, {
        deepAnalysis,
        status: 'completed',
      });
    } catch (error) {
      console.error('Analysis error:', error);
      updateAnalysisCache(selectedProtocol.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Analyse fehlgeschlagen',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedProtocol, apiKeys.geminiKey, settings.geminiModel, settings.thinkingBudget, updateAnalysisCache]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!selectedProtocol || !apiKeys.geminiKey || !message.trim()) return;

      // Reset chat if protocol changed
      if (currentProtocolIdRef.current !== selectedProtocol.id) {
        chatSessionRef.current = null;
        clearChatMessages();
        currentProtocolIdRef.current = selectedProtocol.id;
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: Date.now(),
      };
      addChatMessage(userMessage);

      // Add placeholder for assistant response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };
      addChatMessage(assistantMessage);

      setIsChatting(true);

      try {
        // Create chat session if needed
        if (!chatSessionRef.current) {
          chatSessionRef.current = await createChatSession(
            selectedProtocol.text,
            apiKeys.geminiKey,
            settings.geminiModel,
            settings.thinkingBudget
          );
        }

        const modelConfig = GEMINI_MODELS[settings.geminiModel];
        const response = await sendChatMessage(
          chatSessionRef.current,
          message,
          modelConfig.supportsThinking
        );

        updateLastMessage(response.text, response.thoughts);
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Chat-Fehler aufgetreten';
        updateLastMessage(`Fehler: ${errorMessage}`);

        // Reset chat session on error
        chatSessionRef.current = null;
      } finally {
        setIsChatting(false);
      }
    },
    [
      selectedProtocol,
      apiKeys.geminiKey,
      settings.geminiModel,
      settings.thinkingBudget,
      addChatMessage,
      clearChatMessages,
      updateLastMessage,
    ]
  );

  const resetChat = useCallback(() => {
    chatSessionRef.current = null;
    currentProtocolIdRef.current = null;
    clearChatMessages();
  }, [clearChatMessages]);

  return {
    // State
    currentAnalysis,
    chatMessages,
    isSummarizing,
    isAnalyzing,
    isChatting,
    hasGeminiKey: !!apiKeys.geminiKey,

    // Actions
    generateSummary: generateProtocolSummary,
    generateAnalysis: generateProtocolAnalysis,
    sendMessage,
    resetChat,
  };
}
