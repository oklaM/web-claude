'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageBubble } from './MessageBubble';
import { ThinkingChain } from './ThinkingChain';
import { ErrorMessage } from './ErrorMessage';
import { ClaudeNotFound } from './ClaudeNotFound';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Bot, Wifi, WifiOff, Rocket } from 'lucide-react';
import { ChatMessage, ThinkingStep, ServerToClientEvents, SocketToServerEvents } from '@/lib/ai-types';

export function ChatInterface() {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, SocketToServerEvents> | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isClaudeConnected, setIsClaudeConnected] = useState(false);
  const [currentThinking, setCurrentThinking] = useState<ThinkingStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [claudeInstalled, setClaudeInstalled] = useState<boolean | null>(null);
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

  useEffect(() => {
    // Check for Claude CLI on mount
    fetch('/api/claude-check')
      .then(res => res.json())
      .then(data => setClaudeInstalled(data.installed))
      .catch(() => setClaudeInstalled(false));
  }, []);

  const handleClaudeMessage = useCallback((data: { type: string; content: string }) => {
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
  }, [currentThinking]);

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
    <div className="min-h-screen bg-[#F8FAFF] relative">
      {/* 顶部动态背景装饰 */}
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-100/50 to-transparent -z-10" />
      <div className="fixed -top-24 -right-24 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="p-6 pt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-[22px] shadow-2xl shadow-indigo-200/50 flex items-center justify-center border border-white">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[18px] flex items-center justify-center shadow-lg">
                <Bot className="text-white" size={20} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Claude AI Chat</h1>
              <div className="flex items-center gap-2">
                {isClaudeConnected ? (
                  <>
                    <Wifi className="text-emerald-500" size={12} />
                    <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">已连接</p>
                  </>
                ) : (
                  <>
                    <WifiOff className="text-slate-400" size={12} />
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                      {isConnected ? '未连接' : '连接中...'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Connection Control Button */}
          <div className="flex items-center gap-2">
            {!isClaudeConnected ? (
              <button
                onClick={startClaude}
                disabled={!isConnected}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-[22px] shadow-lg shadow-indigo-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {isConnected ? '启动 Claude' : '连接中...'}
              </button>
            ) : (
              <button
                onClick={stopClaude}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-[22px] shadow-lg shadow-red-300/50 transition-all active:scale-95"
              >
                停止
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 pb-32">
        {/* Error Message */}
        {error && (
          <div className="mb-4">
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Claude CLI Not Found */}
        {claudeInstalled === false && (
          <div className="mb-4">
            <ClaudeNotFound />
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          {messages.length === 0 && !currentThinking.length && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-[32px] flex items-center justify-center">
                <Bot className="text-indigo-500" size={40} />
              </div>
              <h2 className="text-lg font-bold text-slate-700 mb-2">准备好开始了</h2>
              <p className="text-sm text-slate-500">点击 "启动 Claude" 开始对话</p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {currentThinking.length > 0 && (
            <ThinkingChain steps={currentThinking} />
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 底部浮动操作栏 - 毛玻璃设计 */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 z-50">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1 h-16 bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white/50 shadow-2xl flex items-center px-6 gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
              className="bg-transparent border-none outline-none w-full text-sm font-bold placeholder:text-slate-400 resize-none max-h-20 py-3"
              disabled={!isClaudeConnected}
              rows={1}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !isClaudeConnected}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[28px] shadow-xl shadow-indigo-300 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90 disabled:active:scale-100"
          >
            <Send size={20} fill="currentColor" />
          </button>
        </div>
      </footer>
    </div>
  );
}
