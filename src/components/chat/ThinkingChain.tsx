'use client';

import { ThinkingStep } from '@/lib/ai-types';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ThinkingChainProps {
  steps: ThinkingStep[];
}

export function ThinkingChain({ steps }: ThinkingChainProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStepIcon = (status: ThinkingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (steps.length === 0) return null;

  return (
    <Card className="mb-4 p-4 bg-blue-50 dark:bg-blue-950">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 w-full text-left font-medium text-sm mb-2"
      >
        <span>Thinking Process</span>
        <span className="text-muted-foreground">({steps.length} steps)</span>
      </button>

      {isExpanded && (
        <div className="space-y-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start space-x-2 text-sm">
              <div className="flex-shrink-0 mt-0.5">{getStepIcon(step.status)}</div>
              <div className="flex-1">
                <div className="font-medium">Step {step.stepNumber}: {step.description}</div>
                {step.details && (
                  <div className="text-xs text-muted-foreground mt-1">{step.details}</div>
                )}
              </div>
              {step.duration && (
                <div className="text-xs text-muted-foreground">{step.duration}ms</div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
