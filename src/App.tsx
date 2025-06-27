import React from "react";
import { ChatPage } from "./features/chat/ChatPage";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="app-container">
      <ChatPage />
    </div>
  );
};

export default App;
