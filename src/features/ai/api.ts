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

// Knowledge discovery function that uses the specialized backend prompt
export const knowledgeDiscovery = async (
  conversationContext: string,
  userInput: string
): Promise<AiResponse> => {
  return await invoke<AiResponse>("knowledge_discovery", {
    conversationContext,
    userInput
  });
};

// Deprecated: Use knowledgeDiscovery instead for knowledge quiz
export const queryAI = async (prompt: string): Promise<AiResponse> => {
  // Create a simple message array with just the prompt
  const messages = [{
    id: 1,
    text: prompt,
    sender: 'user' as const
  }];

  return await invoke<AiResponse>("send_message_to_mistral", { 
    messages
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

// New: extract knowledge tags from conversation
export const extractKnowledgeFromConversation = async (conversation: string): Promise<Array<{title: string, confidence: string}>> => {
  try {
    const response = await invoke<string>("extract_knowledge_from_conversation", { 
      conversation
    });
    
    const parsed = JSON.parse(response);
    return parsed.hasKnowledge ? parsed.tags : [];
  } catch (error) {
    console.error('Knowledge extraction failed:', error);
    return [];
  }
}; 