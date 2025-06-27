import { useState, useEffect } from "react";
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
        text: aiResponse,
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
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-bubble">
                  {message.text}
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
