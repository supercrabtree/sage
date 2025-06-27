import React from 'react';
import { Message } from './Message';
import { Message as MessageType } from '../../../shared/types';
import { TypingAnimation } from '../../../shared/components';
import './MessageList.css';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  setAiMessageRef: (messageId: number) => (el: HTMLDivElement | null) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading, 
  messagesEndRef, 
  setAiMessageRef 
}) => {
  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="empty-state">
          <p>Start a conversation to begin learning!</p>
        </div>
      ) : (
        messages.map(message => (
          <Message 
            key={message.id} 
            message={message}
            setAiMessageRef={message.sender === 'ai' ? setAiMessageRef(message.id) : undefined}
          />
        ))
      )}
      {isLoading && (
        <div className="message ai">
          <div className="message-bubble loading">
            <TypingAnimation />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} className="scroll-target" />
    </div>
  );
}; 