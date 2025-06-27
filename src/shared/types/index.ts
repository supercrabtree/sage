export interface BaseMessage {
  id: number;
  text: string;
  timestamp: Date;
}

export interface UserMessage extends BaseMessage {
  sender: 'user';
  // No formattedText - user messages are always plain text
}

export interface AiMessage extends BaseMessage {
  sender: 'ai';
  formattedText: string; // Required for AI messages - always has HTML formatting
}

export type Message = UserMessage | AiMessage;

export interface AiResponse {
  original: string;
  formatted: string;
} 