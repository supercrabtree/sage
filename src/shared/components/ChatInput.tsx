import React, { useState } from 'react';
import { SendIcon } from './SendIcon';
import './ChatInput.css';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  placeholder = "Type a message...",
  multiline = false,
  className = "",
  disabled = false
}) => {
  const [inputText, setInputText] = useState("");

  const handleSendMessage = () => {
    if (inputText.trim() === "" || isLoading || disabled) return;
    
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const InputComponent = multiline ? 'textarea' : 'input';
  const inputProps = multiline 
    ? { rows: 2 } 
    : { type: 'text' as const };

  return (
    <div className={`chat-input-container ${className}`}>
      <InputComponent
        {...inputProps}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`chat-input ${multiline ? 'multiline' : ''}`}
        disabled={isLoading || disabled}
      />
      <button 
        onClick={handleSendMessage}
        className="chat-send-button"
        disabled={isLoading || inputText.trim() === "" || disabled}
      >
        <SendIcon />
      </button>
    </div>
  );
}; 