import React, { useState } from "react";
import { ChatPage } from "./features/chat/ChatPage";
import { KnowledgePage } from "./features/knowledge";
import { HamburgerButton, Sidebar, useSidebar } from "./features/sidebar";
import { useChat } from "./features/chat/hooks/useChat";
import "./App.css";

type Page = 'chat' | 'knowledge';

const App: React.FC = () => {
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const chatHook = useChat();
  const [currentPage, setCurrentPage] = useState<Page>('chat');

  const handleClearChat = () => {
    chatHook.clearChat();
    closeSidebar();
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    closeSidebar();
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatPage chatHook={chatHook} />;
      case 'knowledge':
        return <KnowledgePage />;
      default:
        return <ChatPage chatHook={chatHook} />;
    }
  };

  return (
    <div className="app-container">
      <HamburgerButton isOpen={isOpen} onClick={toggleSidebar} />
      <Sidebar 
        isOpen={isOpen} 
        onClose={closeSidebar}
        onClearChat={handleClearChat}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      <div className={`main-content ${isOpen ? 'sidebar-open' : ''}`}>
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default App;
