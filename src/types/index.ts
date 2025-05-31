export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  citations?: Citation[];
}

export interface Citation {
  source: string;
  audioFile: string;
  letter: string;
  title: string;
  excerpt: string;
  confidence: number;
}

export interface InterviewData {
  letter: string;
  title: string;
  filename: string;
  audioFilename: string;
  content: string;
  topics: string[];
  length?: number;
  wordCount?: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

export interface Dictionary {
  id: string;
  term: string;
  definition: string;
  source?: string;
} 