'use client';

import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-[28px] border-2 border-red-200/50 shadow-lg shadow-red-200/30 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-[20px] flex items-center justify-center shadow-md flex-shrink-0">
          <AlertCircle className="text-white" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-red-900 mb-1">发生错误</h3>
          <p className="text-sm font-medium text-red-700 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center text-red-600 transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
