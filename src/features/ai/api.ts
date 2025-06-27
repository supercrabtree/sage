import { invoke } from "@tauri-apps/api/core";
import { Message, AiResponse } from "../../shared/types";

export const sendMessageToAI = async (messages: Message[]): Promise<AiResponse> => {
  // Prepare conversation history for API - use original text
  const conversationHistory = messages.map(msg => ({
    id: msg.id,
    text: msg.text, // Always contains the original text
    sender: msg.sender
  }));

  return await invoke<AiResponse>("send_message_to_mistral", { 
    messages: conversationHistory
  });
}; 