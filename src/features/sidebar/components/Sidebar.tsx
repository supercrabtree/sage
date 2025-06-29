import React from 'react';
import './Sidebar.css';

type Page = 'chat' | 'knowledge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onClearChat: () => void;
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onClearChat, 
  onNavigate, 
  currentPage 
}) => {
  const handleMenuItemClick = (action: string) => {
    console.log(`${action} clicked`);
    onClose();
  };

  const handleClearChatClick = () => {
    onClearChat();
  };

  const handleNavigateClick = (page: Page) => {
    onNavigate(page);
  };

  return (
    <>
      <div 
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Sage</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button 
                className={`sidebar-item ${currentPage === 'chat' ? 'active' : ''}`}
                onClick={() => handleNavigateClick('chat')}
              >
                <span className="sidebar-icon">💬</span>
                Chat
              </button>
            </li>
            <li>
              <button 
                className={`sidebar-item ${currentPage === 'knowledge' ? 'active' : ''}`}
                onClick={() => handleNavigateClick('knowledge')}
              >
                <span className="sidebar-icon">🧠</span>
                My Knowledge
              </button>
            </li>
            <li>
            </li>
            <li>
              <button 
                className="sidebar-item" 
                onClick={() => handleMenuItemClick('New Chat')}
              >
                <span className="sidebar-icon">✨</span>
                New Conversation
              </button>
            </li>
            <li>
              <button 
                className="sidebar-item" 
                onClick={() => handleMenuItemClick('Chat History')}
              >
                <span className="sidebar-icon">📝</span>
                Conversation History
              </button>
            </li>
            <li>
              <button 
                className="sidebar-item" 
                onClick={() => handleMenuItemClick('Spaced Repetition')}
              >
                <span className="sidebar-icon">🔄</span>
                Spaced Repetition
              </button>
            </li>
            <li>
              <button 
                className="sidebar-item" 
                onClick={() => handleMenuItemClick('Settings')}
              >
                <span className="sidebar-icon">⚙️</span>
                Settings
              </button>
            </li>
            <li>
              <button className="sidebar-item" onClick={handleClearChatClick}>
                <span className="sidebar-icon">🗑️</span>
                Clear Current Chat
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button 
            className="sidebar-item" 
            onClick={() => handleMenuItemClick('Help & Support')}
          >
            <span className="sidebar-icon">❓</span>
            Help & Support
          </button>
        </div>
      </div>
    </>
  );
}; 