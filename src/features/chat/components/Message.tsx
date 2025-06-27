import React from 'react';
import { Message as MessageType } from '../../../shared/types';
import './Message.css';

interface MessageProps {
  message: MessageType;
  setAiMessageRef?: (el: HTMLDivElement | null) => void;
}

export const Message: React.FC<MessageProps> = ({ message, setAiMessageRef }) => {
  return (
    <div 
      className={`message ${message.sender}`}
      ref={message.sender === 'ai' ? setAiMessageRef : undefined}
    >
      <div className="message-bubble">
        {message.sender === 'ai' ? (
          <div dangerouslySetInnerHTML={{ __html: message.formattedText }} />
        ) : (
          message.text
        )}
      </div>
    </div>
  );
}; 