import { useEffect, useRef } from 'react';
import { Message } from '../../../shared/types';

export const useScrollManager = (messages: Message[], isLoading: boolean) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiMessageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Scroll to bottom for user messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll AI message to top of chat window
  const scrollAiMessageToTop = (messageId: number) => {
    const aiMessageElement = aiMessageRefs.current[messageId];
    if (aiMessageElement) {
      aiMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle scrolling based on the latest message
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.sender === 'ai') {
        // Scroll AI message to top
        setTimeout(() => scrollAiMessageToTop(latestMessage.id), 100);
      } else {
        // Scroll to bottom for user messages
        scrollToBottom();
      }
    }
  }, [messages]);

  // Scroll when loading state changes (for typing animation)
  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  const setAiMessageRef = (messageId: number) => (el: HTMLDivElement | null) => {
    aiMessageRefs.current[messageId] = el;
  };

  return {
    messagesEndRef,
    setAiMessageRef
  };
}; 