import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onClearChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onClearChat }) => {
  const handleMenuItemClick = (action: string) => {
    console.log(`${action} clicked`);
    onClose();
  };

  const handleClearChatClick = () => {
    onClearChat();
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
                className="sidebar-item" 
                onClick={() => handleMenuItemClick('New Chat')}
              >
                <span className="sidebar-icon">💬</span>
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
                onClick={() => handleMenuItemClick('My Knowledge')}
              >
                <span className="sidebar-icon">🧠</span>
                My Knowledge
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