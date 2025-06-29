import React from 'react';
import { useChat } from './hooks/useChat';
import { useScrollManager } from './hooks/useScrollManager';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import './ChatPage.css';

interface ChatPageProps {
  chatHook: ReturnType<typeof useChat>;
}

export const ChatPage: React.FC<ChatPageProps> = ({ chatHook }) => {
  const { 
    messages, 
    messageOptions, 
    clickedOptions, 
    isLoading, 
    sendMessage, 
    handleOptionClick, 
    retryOptionExtraction
  } = chatHook;
  
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