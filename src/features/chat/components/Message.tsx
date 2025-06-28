import React from 'react';
import { Message as MessageType, MessageOptionState } from '../../../shared/types';
import './Message.css';

interface MessageProps {
  message: MessageType;
  setAiMessageRef?: (el: HTMLDivElement | null) => void;
  optionState?: MessageOptionState;
  clickedOptions: Set<string>;
  onOptionClick: (option: string) => void;
  onRetryOptions: (messageId: number) => void;
}

const OptionsSection: React.FC<{
  messageId: number;
  optionState?: MessageOptionState;
  clickedOptions: Set<string>;
  onOptionClick: (option: string) => void;
  onRetryOptions: (messageId: number) => void;
}> = ({ messageId, optionState, clickedOptions, onOptionClick, onRetryOptions }) => {
  if (!optionState) return null;

  if (optionState.loading) {
    return (
      <div className="options-loading">
        <div className="loading-pills">
          {[1, 2, 3].map(i => (
            <div key={i} className="loading-pill" />
          ))}
        </div>
      </div>
    );
  }

  if (optionState.error) {
    return (
      <div className="options-error">
        <span className="error-text">{optionState.error}</span>
        <button 
          className="retry-button"
          onClick={() => onRetryOptions(messageId)}
        >
          Retry
        </button>
      </div>
    );
  }

  if (optionState.options.length > 0) {
    return (
      <div className="message-options animate-in">
        {optionState.options.map((option, index) => (
          <button
            key={index}
            className={`option-pill ${clickedOptions.has(option) ? 'clicked' : ''}`}
            onClick={() => onOptionClick(option)}
          >
            {option}
          </button>
        ))}
      </div>
    );
  }

  return null;
};

export const Message: React.FC<MessageProps> = ({ 
  message, 
  setAiMessageRef, 
  optionState,
  clickedOptions,
  onOptionClick,
  onRetryOptions
}) => {
  return (
    <div 
      className={`message ${message.sender}`}
      ref={message.sender === 'ai' ? setAiMessageRef : undefined}
    >
      <div className="message-bubble">
        {message.sender === 'ai' ? (
          <>
            <div dangerouslySetInnerHTML={{ __html: message.formattedText }} />
            <OptionsSection
              messageId={message.id}
              optionState={optionState}
              clickedOptions={clickedOptions}
              onOptionClick={onOptionClick}
              onRetryOptions={onRetryOptions}
            />
          </>
        ) : (
          message.text
        )}
      </div>
    </div>
  );
}; 