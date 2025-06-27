import React from 'react';
import { useChat } from './hooks/useChat';
import { useScrollManager } from './hooks/useScrollManager';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import './ChatPage.css';

export const ChatPage: React.FC = () => {
  const { messages, isLoading, sendMessage } = useChat();
  const { messagesEndRef, setAiMessageRef } = useScrollManager(messages, isLoading);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="chat-title">Sage 🌿</h1>
      </div>
      
      <MessageList 
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        setAiMessageRef={setAiMessageRef}
      />

      <ChatInput 
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}; 