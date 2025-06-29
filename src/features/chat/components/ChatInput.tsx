import React from 'react';
import { ChatInput as SharedChatInput } from '../../../shared/components';
import './ChatInput.css';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  return (
    <div className="chat-input-wrapper">
      <SharedChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        placeholder="Ask Sage anything..."
        className="chat-style"
      />
    </div>
  );
}; 