export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  thinking?: ThinkingStep[];
  artifacts?: Artifact[];
}

export interface ThinkingStep {
  id: string;
  stepNumber: number;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  details?: string;
  duration?: number;
}

export interface Artifact {
  id: string;
  type: 'file' | 'code' | 'command_output';
  content: string;
  filePath?: string;
  language?: string;
}

export interface ClaudeSocketMessage {
  type: 'thinking' | 'command' | 'result' | 'error';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface SocketToServerEvents {
  userMessage: (data: { message: string }) => void;
  startClaude: () => void;
  stopClaude: () => void;
}

export interface ServerToClientEvents {
  claudeMessage: (message: ClaudeSocketMessage) => void;
  claudeStatus: (status: { status: 'connected' | 'disconnected' }) => void;
}
