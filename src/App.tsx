import React from "react";
import { ChatPage } from "./features/chat/ChatPage";
import { HamburgerButton, Sidebar, useSidebar } from "./features/sidebar";
import { useChat } from "./features/chat/hooks/useChat";
import "./App.css";

const App: React.FC = () => {
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const chatHook = useChat();

  const handleClearChat = () => {
    chatHook.clearChat();
    closeSidebar();
  };

  return (
    <div className="app-container">
      <HamburgerButton isOpen={isOpen} onClick={toggleSidebar} />
      <Sidebar 
        isOpen={isOpen} 
        onClose={closeSidebar}
        onClearChat={handleClearChat}
      />
      <div className={`main-content ${isOpen ? 'sidebar-open' : ''}`}>
        <ChatPage chatHook={chatHook} />
      </div>
    </div>
  );
};

export default App;
