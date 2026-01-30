'use client';

import { ThinkingStep } from '@/lib/ai-types';
import { CheckCircle, Clock, AlertCircle, Loader2, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { useState } from 'react';

interface ThinkingChainProps {
  steps: ThinkingStep[];
}

export function ThinkingChain({ steps }: ThinkingChainProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getStepIcon = (status: ThinkingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStepBorderClass = (status: ThinkingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-emerald-200 bg-emerald-50/50';
      case 'in_progress':
        return 'border-indigo-200 bg-indigo-50/50';
      case 'failed':
        return 'border-red-200 bg-red-50/50';
      default:
        return 'border-slate-200 bg-slate-50/50';
    }
  };

  if (steps.length === 0) return null;

  return (
    <div className="mb-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[32px] border border-white/50 shadow-lg shadow-indigo-100/40 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <Brain className="text-white" size={16} />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-800">思考过程</span>
            <span className="ml-2 text-xs font-bold text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">
              {steps.length} 步骤
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-slate-400" size={20} />
        ) : (
          <ChevronDown className="text-slate-400" size={20} />
        )}
      </button>

      {/* Steps */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-[20px] border-2 ${getStepBorderClass(step.status)} backdrop-blur-sm transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{getStepIcon(step.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      步骤 {step.stepNumber}
                    </span>
                    {step.duration && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {step.duration}ms
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {step.description}
                  </p>
                  {step.details && (
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {step.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
