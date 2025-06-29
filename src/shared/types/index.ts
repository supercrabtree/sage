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

// New: types for option extraction
export interface OptionExtractionResponse {
  hasOptions: boolean;
  options: string[];
}

export interface MessageOptionState {
  options: string[];
  loading: boolean;
  error?: string;
}

// Knowledge Tag types
export type ConfidenceLevel = 'Beginner' | 'Intermediate' | 'Expert';

export interface KnowledgeTag {
  id: string;
  title: string;
  confidence: ConfidenceLevel;
  createdAt: Date;
  source: 'discovered' | 'manual'; // discovered = through AI, manual = user added
}

export interface QuizMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestedTags?: Omit<KnowledgeTag, 'id' | 'createdAt'>[]; // AI messages can suggest partial tags
}

export interface QuizSession {
  id: string;
  messages: QuizMessage[];
  suggestedTags: Omit<KnowledgeTag, 'id' | 'createdAt'>[];
  isActive: boolean;
  startedAt: Date;
} 