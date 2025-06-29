import React, { useState } from 'react';
import { SendIcon } from '../../../shared/components';
import './ChatInput.css';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState("");

  const handleSendMessage = () => {
    if (inputText.trim() === "" || isLoading) return;
    
    onSendMessage(inputText);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="input-container">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Sage anything..."
        className="message-input"
        disabled={isLoading}
        data-testid="chat-input"
      />
      <button 
        onClick={handleSendMessage}
        className="send-button"
        disabled={isLoading || inputText.trim() === ""}
        data-testid="send-button"
      >
        <SendIcon />
      </button>
    </div>
  );
}; 