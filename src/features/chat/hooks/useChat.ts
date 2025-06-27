import { useState, useEffect } from 'react';
import { Message, UserMessage, AiMessage } from '../../../shared/types';
import { loadMessages, saveMessages, clearChatHistory } from '../../../shared/utils/storage';
import { sendMessageToAI } from '../../ai/api';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load messages from localStorage on startup
  useEffect(() => {
    const savedMessages = loadMessages();
    setMessages(savedMessages);
    setIsInitialized(true);
  }, []);

  // Save messages to localStorage whenever messages change (but not on initial load)
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, isInitialized]);

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
      const aiResponse = await sendMessageToAI(newMessages);
      
      const aiMessage: AiMessage = {
        id: Date.now() + 1,
        text: aiResponse.original, // Store original markdown for future API calls
        formattedText: aiResponse.formatted, // Store HTML for display
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
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

  const clearChat = () => {
    const initialMessages = clearChatHistory();
    setMessages(initialMessages);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat
  };
}; 