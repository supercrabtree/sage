import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiMessageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Scroll to bottom for user messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll AI message to top of chat window
  const scrollAiMessageToTop = (messageId: number) => {
    const aiMessageElement = aiMessageRefs.current[messageId];
    if (aiMessageElement) {
      aiMessageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle scrolling based on the latest message
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.sender === 'ai') {
        // Scroll AI message to top
        setTimeout(() => scrollAiMessageToTop(latestMessage.id), 100);
      } else {
        // Scroll to bottom for user messages
        scrollToBottom();
      }
    }
  }, [messages]);

  // Scroll when loading state changes (for typing animation)
  useEffect(() => {
    if (isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  // Add initial example messages to match the screenshot
  useEffect(() => {
    const initialMessages: Message[] = [
      {
        id: 1,
        text: "Hello, I'm Sage 🌿 Ready to explore something new together?",
        sender: 'ai',
        timestamp: new Date()
      },
    ];
    setMessages(initialMessages);
  }, []);

  const handleSendMessage = async () => {
    if (inputText.trim() === "" || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    const currentInput = inputText;
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const aiResponse = await invoke<string>("send_message_to_mistral", { 
        message: currentInput 
      });
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse, // This is now HTML from the Rust backend
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: `Error: ${error}`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const SendIcon = () => (
    <svg className="send-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
    </svg>
  );

  const TypingAnimation = () => (
    <div className="typing-animation">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="chat-container">
        <div className="chat-header">
          <h1 className="app-title">Sage 🌿</h1>
        </div>
        
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>Start a conversation to begin learning!</p>
            </div>
          ) : (
            messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.sender}`}
                ref={message.sender === 'ai' ? (el) => {
                  aiMessageRefs.current[message.id] = el;
                } : undefined}
              >
                <div className="message-bubble">
                  {message.sender === 'ai' ? (
                    <div dangerouslySetInnerHTML={{ __html: message.text }} />
                  ) : (
                    message.text
                  )}
                </div>
              </div>
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

        <div className="input-container">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Sage anything..."
            className="message-input"
            disabled={isLoading}
          />
          <button 
            onClick={handleSendMessage}
            className="send-button"
            disabled={isLoading || inputText.trim() === ""}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
