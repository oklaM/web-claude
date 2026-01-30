'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageBubble } from './MessageBubble';
import { ThinkingChain } from './ThinkingChain';
import { ErrorMessage } from './ErrorMessage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { ChatMessage, ThinkingStep, ServerToClientEvents, SocketToServerEvents } from '@/lib/ai-types';

export function ChatInterface() {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, SocketToServerEvents> | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isClaudeConnected, setIsClaudeConnected] = useState(false);
  const [currentThinking, setCurrentThinking] = useState<ThinkingStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:3004', {
      path: '/ai-orchestrator',
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to AI Orchestrator');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      setIsClaudeConnected(false);
    });

    socketInstance.on('claude-message', (data) => {
      handleClaudeMessage(data);
    });

    socketInstance.on('claude-status', (status) => {
      setIsClaudeConnected(status.status === 'connected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClaudeMessage = (data: { type: string; content: string }) => {
    // Handle thinking steps
    if (data.type === 'thinking') {
      const newStep: ThinkingStep = {
        id: Date.now().toString(),
        stepNumber: currentThinking.length + 1,
        description: data.content,
        status: 'in_progress',
      };
      setCurrentThinking((prev) => [...prev, newStep]);
    }
    // Handle final result
    else if (data.type === 'result') {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        thinking: currentThinking.length > 0 ? [...currentThinking] : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentThinking([]);
    }
    // Handle errors
    else if (data.type === 'error') {
      setError(data.content);
      // Also add to messages as before
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: `Error: ${data.content}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    socket.emit('userMessage', { message: input });
    setInput('');
  };

  const startClaude = () => {
    socket?.emit('startClaude');
  };

  const stopClaude = () => {
    socket?.emit('stopClaude');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Claude Code Chat</h2>
            <p className="text-sm text-muted-foreground">
              {isClaudeConnected ? 'Connected to Claude CLI' : 'Not connected'}
            </p>
          </div>
          <div className="flex space-x-2">
            {!isClaudeConnected ? (
              <Button onClick={startClaude} disabled={!isConnected}>
                {isConnected ? 'Start Claude' : 'Connecting...'}
              </Button>
            ) : (
              <Button onClick={stopClaude} variant="destructive">
                Stop Claude
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {currentThinking.length > 0 && (
          <ThinkingChain steps={currentThinking} />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <Card className="p-4">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="flex-1 min-h-[60px] resize-none"
            disabled={!isClaudeConnected}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || !isClaudeConnected}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
