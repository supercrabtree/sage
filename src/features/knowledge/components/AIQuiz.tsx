import React, { useState, useRef, useEffect } from 'react';
import { KnowledgeTag, QuizMessage, ConfidenceLevel } from '../../../shared/types';
import { knowledgeDiscovery, extractKnowledgeFromConversation } from '../../ai/api';
import { ChatInput, ChatMessage, TypingAnimation } from '../../../shared/components';
import { SuggestedTags } from './SuggestedTags';
import './AIQuiz.css';

interface AIQuizProps {
  existingTags: KnowledgeTag[];
  onAddTag: (tag: Omit<KnowledgeTag, 'id' | 'createdAt'>) => void;
}

export const AIQuiz: React.FC<AIQuizProps> = ({ existingTags, onAddTag }) => {
  const [messages, setMessages] = useState<QuizMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startQuiz = () => {
    setIsQuizActive(true);
    const welcomeMessage: QuizMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      content: "Hello! I'd love to learn about what you already know. What's your background in? (e.g., programming, design, mathematics, etc.)",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const resetQuiz = () => {
    setIsQuizActive(false);
    setMessages([]);
  };

  const extractKnowledgeFromMessages = async (messages: QuizMessage[]): Promise<Omit<KnowledgeTag, 'id' | 'createdAt'>[]> => {
    // Convert messages to conversation format for extraction
    const conversation = messages.map(msg => 
      `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.content}`
    ).join('\n');

    try {
      const extractedTags = await extractKnowledgeFromConversation(conversation);
      
      // Filter out existing tags and convert to our format
      const newTags: Omit<KnowledgeTag, 'id' | 'createdAt'>[] = [];
      
      for (const tag of extractedTags) {
        const exists = existingTags.some(existingTag => 
          existingTag.title.toLowerCase() === tag.title.toLowerCase()
        );
        
        if (!exists && !newTags.some(newTag => newTag.title.toLowerCase() === tag.title.toLowerCase())) {
          newTags.push({
            title: tag.title,
            confidence: tag.confidence as ConfidenceLevel,
            source: 'discovered'
          });
        }
      }
      
      return newTags;
    } catch (error) {
      console.error('Failed to extract knowledge:', error);
      return [];
    }
  };

  const handleSendMessage = async (userInput: string) => {
    const userMessage: QuizMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const conversationContext = messages.map(msg => 
        `${msg.sender}: ${msg.content}`
      ).join('\n');

      const response = await knowledgeDiscovery(
        conversationContext,
        userInput
      );

      const aiMessage: QuizMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        content: response.formatted,
        timestamp: new Date()
      };

      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);

      // Extract knowledge from the updated conversation
      const newTags = await extractKnowledgeFromMessages([userMessage, aiMessage]);
      if (newTags.length > 0) {
        // Update the AI message with suggested tags
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessage.id 
            ? { ...msg, suggestedTags: newTags }
            : msg
        ));
      }
    } catch (error) {
      console.error('Error in AI quiz:', error);
      const errorMessage: QuizMessage = {
        id: Date.now().toString(),
        sender: 'ai',
        content: "I'm sorry, I had trouble processing that. Could you try again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const addSuggestedTag = (tag: Omit<KnowledgeTag, 'id' | 'createdAt'>) => {
    onAddTag(tag);
    // Remove the tag from all messages that have it
    setMessages(prev => prev.map(msg => ({
      ...msg,
      suggestedTags: msg.suggestedTags?.filter(t => t.title !== tag.title)
    })));
  };

  if (!isQuizActive) {
    return (
      <div className="ai-quiz-container">
        <div className="quiz-welcome">
          <h2>🤖 AI Knowledge Discovery</h2>
          <p>
            Let me help you discover what you already know! I'll ask you some questions 
            to identify specific skills and topics you can add to your knowledge collection.
          </p>
          <button onClick={startQuiz} className="start-quiz-btn" data-testid="start-quiz-button">
            Start Knowledge Discovery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-quiz-container">
      <div className="quiz-header">
        <h2>🤖 Knowledge Discovery Chat</h2>
        <button onClick={resetQuiz} className="reset-quiz-btn">
          Reset
        </button>
      </div>

      <div className="quiz-messages">
        {messages.map((message) => (
          <div key={message.id} className="message-with-tags">
            <ChatMessage message={message} />
            {message.suggestedTags && (
              <SuggestedTags
                tags={message.suggestedTags}
                onAddTag={addSuggestedTag}
                className="underneath"
              />
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="chat-message ai">
            <div className="chat-message-content">
              <TypingAnimation />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        placeholder="Tell me about your experience..."
        multiline={true}
        className="quiz-style"
      />
    </div>
  );
}; 