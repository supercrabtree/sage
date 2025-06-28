import { invoke } from "@tauri-apps/api/core";
import { Message, AiResponse, OptionExtractionResponse } from "../../shared/types";

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

// New: separate function for option extraction
export const extractOptionsFromMessage = async (message: string): Promise<string[]> => {
  try {
    const response = await invoke<string>("extract_options_from_message", { 
      message
    });
    
    const parsed: OptionExtractionResponse = JSON.parse(response);
    return parsed.hasOptions ? parsed.options : [];
  } catch (error) {
    return [];
  }
}; 