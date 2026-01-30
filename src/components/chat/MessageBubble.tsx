'use client';

import { ChatMessage } from '@/lib/ai-types';
import { Card } from '@/components/ui/card';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <Card className={`max-w-[80%] p-4 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
        <div className="flex items-start space-x-2">
          {isUser ? (
            <User className="h-5 w-5 mt-1 flex-shrink-0" />
          ) : (
            <Bot className="h-5 w-5 mt-1 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.thinking && message.thinking.length > 0 && (
              <div className="mt-2 text-xs opacity-70">
                {message.thinking.length} thinking steps
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
