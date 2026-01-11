
export type Role = 'user' | 'assistant';

export interface FileData {
  data: string;
  mimeType: string;
}

export interface GlossaryItem {
  id: string;
  term: string;
  definition: string;
  timestamp: Date;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  attachment?: FileData;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  glossary: GlossaryItem[];
}
