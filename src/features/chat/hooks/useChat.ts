import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, UserMessage, AiMessage, MessageOptionState, KnowledgeTag } from '../../../shared/types';
import { loadMessages, saveMessages, clearChatHistory, loadKnowledgeTags } from '../../../shared/utils/storage';
import { sendMessageToAI, sendMessageWithKnowledge, extractOptionsFromMessage } from '../../ai/api';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [knowledgeTags, setKnowledgeTags] = useState<KnowledgeTag[]>([]);
  
  // New: Option state management
  const [messageOptions, setMessageOptions] = useState<Map<number, MessageOptionState>>(new Map());
  const [clickedOptions, setClickedOptions] = useState(new Set<string>());
  
  // Track pending option extractions to avoid duplicates
  const pendingExtractions = useRef(new Set<number>());

  // Load messages and knowledge tags from localStorage on startup
  useEffect(() => {
    const savedMessages = loadMessages();
    const savedKnowledgeTags = loadKnowledgeTags();
    setMessages(savedMessages);
    setKnowledgeTags(savedKnowledgeTags);
    setIsInitialized(true);
  }, []);

  // Save messages to localStorage whenever messages change (but not on initial load)
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, isInitialized]);

  const updateMessageOptions = useCallback((
    messageId: number, 
    update: { options?: string[]; loading?: boolean; error?: string }
  ) => {
    setMessageOptions(prev => {
      const next = new Map(prev);
      const current = next.get(messageId) || { options: [], loading: false };
      next.set(messageId, { ...current, ...update });
      return next;
    });
  }, []);

  const sendMessage = async (inputText: string) => {
    if (inputText.trim() === "" || isLoading) return;

    const userMessage: UserMessage = {
      id: Date.now(),
      text: inputText, // Plain text for user messages
      sender: 'user',
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Use knowledge context if available, otherwise fall back to regular messaging
      const aiResponse = knowledgeTags.length > 0 
        ? await sendMessageWithKnowledge(newMessages, knowledgeTags)
        : await sendMessageToAI(newMessages);
      
      const aiMessageId = Date.now() + 1;
      const aiMessage: AiMessage = {
        id: aiMessageId,
        text: aiResponse.original, // Store original markdown for future API calls
        formattedText: aiResponse.formatted, // Store HTML for display
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Extract options asynchronously
      if (pendingExtractions.current.has(aiMessageId)) return;
      
      pendingExtractions.current.add(aiMessageId);
      updateMessageOptions(aiMessageId, { loading: true });
      
      try {
        const options = await extractOptionsFromMessage(aiResponse.original);
        
        if (pendingExtractions.current.has(aiMessageId)) {
          updateMessageOptions(aiMessageId, { 
            options, 
            loading: false 
          });
        }
      } catch (error) {
        if (pendingExtractions.current.has(aiMessageId)) {
          updateMessageOptions(aiMessageId, { 
            loading: false, 
            error: 'Failed to load options' 
          });
        }
      } finally {
        pendingExtractions.current.delete(aiMessageId);
      }
      
    } catch (error) {
      const errorMessage: AiMessage = {
        id: Date.now() + 1,
        text: `Error: ${error}`,
        formattedText: `Error: ${error}`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = useCallback((option: string) => {
    setClickedOptions(prev => {
      if (prev.has(option)) return prev;
      return new Set(prev).add(option);
    });
    
    setTimeout(() => {
      sendMessage(option);
      setClickedOptions(prev => {
        const next = new Set(prev);
        next.delete(option);
        return next;
      });
    }, 150);
  }, [sendMessage]);

  const retryOptionExtraction = useCallback((messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || message.sender !== 'ai') return;

    pendingExtractions.current.add(messageId);
    updateMessageOptions(messageId, { loading: true, error: undefined });

    extractOptionsFromMessage(message.text).then(options => {
      if (pendingExtractions.current.has(messageId)) {
        updateMessageOptions(messageId, { options, loading: false });
      }
    }).catch(() => {
      if (pendingExtractions.current.has(messageId)) {
        updateMessageOptions(messageId, { 
          loading: false, 
          error: 'Failed to load options' 
        });
      }
    }).finally(() => {
      pendingExtractions.current.delete(messageId);
    });
  }, [messages, updateMessageOptions]);

  const clearChat = () => {
    const initialMessages = clearChatHistory();
    setMessages(initialMessages);
    setMessageOptions(new Map());
    setClickedOptions(new Set());
    pendingExtractions.current.clear();
  };

  return {
    messages,
    messageOptions,
    clickedOptions,
    isLoading,
    knowledgeTags,
    sendMessage,
    handleOptionClick,
    retryOptionExtraction,
    clearChat
  };
}; 