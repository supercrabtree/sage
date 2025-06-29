import { Message, AiMessage, KnowledgeTag } from '../types';

const CHAT_STORAGE_KEY = 'sage-chat-history';
const KNOWLEDGE_TAGS_KEY = 'sage-knowledge-tags';

export const saveMessages = (messages: Message[]): void => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

export const loadMessages = (): Message[] => {
  try {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      // Convert timestamp strings back to Date objects
      return parsedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
    return initialMessages;
  } catch (error) {
    console.error('Error loading chat history:', error);
    return initialMessages;
  }
};

export const clearChatHistory = (): Message[] => {
  localStorage.removeItem(CHAT_STORAGE_KEY);
  return initialMessages;
};

const initialMessages: AiMessage[] = [
  {
    id: 1,
    text: "Hello, I'm Sage 🌿 Ready to explore something new together?",
    formattedText: "Hello, I'm Sage 🌿 Ready to explore something new together?",
    sender: 'ai',
    timestamp: new Date()
  },
];

// Knowledge Tags Storage
export const saveKnowledgeTags = (tags: KnowledgeTag[]): void => {
  try {
    localStorage.setItem(KNOWLEDGE_TAGS_KEY, JSON.stringify(tags));
  } catch (error) {
    console.error('Error saving knowledge tags:', error);
  }
};

export const loadKnowledgeTags = (): KnowledgeTag[] => {
  try {
    const savedTags = localStorage.getItem(KNOWLEDGE_TAGS_KEY);
    if (savedTags) {
      const parsedTags = JSON.parse(savedTags);
      // Convert timestamp strings back to Date objects
      return parsedTags.map((tag: any) => ({
        ...tag,
        createdAt: new Date(tag.createdAt)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading knowledge tags:', error);
    return [];
  }
};

export const clearKnowledgeTags = (): void => {
  localStorage.removeItem(KNOWLEDGE_TAGS_KEY);
};