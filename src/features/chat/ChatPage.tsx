import React from 'react';
import { useChat } from './hooks/useChat';
import { useScrollManager } from './hooks/useScrollManager';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import './ChatPage.css';

export const ChatPage: React.FC = () => {
  const { 
    messages, 
    messageOptions, 
    clickedOptions, 
    isLoading, 
    sendMessage, 
    handleOptionClick, 
    retryOptionExtraction, 
    clearChat 
  } = useChat();
  const { messagesEndRef, setAiMessageRef } = useScrollManager(messages, isLoading);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="chat-title">Sage 🌿</h1>
        <button 
          className="clear-button"
          onClick={clearChat}
          disabled={isLoading}
        >
          Clear
        </button>
      </div>
      
      <MessageList 
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef}
        setAiMessageRef={setAiMessageRef}
        messageOptions={messageOptions}
        clickedOptions={clickedOptions}
        onOptionClick={handleOptionClick}
        onRetryOptions={retryOptionExtraction}
      />

      <ChatInput 
        onSendMessage={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}; 