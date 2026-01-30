'use client';

import { ChatMessage } from '@/lib/ai-types';
import { User, Bot, AlertCircle } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
          <AlertCircle size={14} />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-[20px] flex items-center justify-center flex-shrink-0 shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
            : 'bg-gradient-to-br from-slate-100 to-slate-200'
        }`}>
          {isUser ? (
            <User className="text-white" size={18} />
          ) : (
            <Bot className="text-slate-600" size={18} />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 p-5 rounded-[28px] shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
            : 'bg-white/70 backdrop-blur-md border border-white text-slate-800'
        }`}>
          <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
          {message.thinking && message.thinking.length > 0 && (
            <div className={`mt-3 pt-3 border-t ${isUser ? 'border-white/20' : 'border-slate-200'}`}>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${
                isUser ? 'text-white/70' : 'text-slate-500'
              }`}>
                💭 {message.thinking.length} 个思考步骤
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
