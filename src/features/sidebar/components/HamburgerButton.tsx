import React from 'react';
import './HamburgerButton.css';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button 
      className={`hamburger-button ${isOpen ? 'open' : ''}`}
      onClick={onClick}
      aria-label="Toggle menu"
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  );
}; 