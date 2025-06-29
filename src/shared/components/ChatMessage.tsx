import React from 'react';
import './ChatMessage.css';

interface BaseMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: BaseMessage;
  className?: string;
  children?: React.ReactNode; // For additional content like suggested tags
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  className = "",
  children
}) => {
  return (
    <div className={`chat-message ${message.sender} ${className}`}>
      <div 
        className="chat-message-content" 
        dangerouslySetInnerHTML={{ __html: message.content }} 
      />
      {children}
    </div>
  );
}; 