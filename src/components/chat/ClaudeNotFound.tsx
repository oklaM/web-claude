'use client';

import { Terminal, Download } from 'lucide-react';
import { getClaudeInstallInstructions } from '@/lib/claude-detection';

export function ClaudeNotFound() {
  const instructions = getClaudeInstallInstructions();

  return (
    <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[32px] border-2 border-amber-200/50 shadow-xl shadow-amber-200/30 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-[24px] flex items-center justify-center shadow-lg flex-shrink-0">
          <Terminal className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-amber-900 mb-2">Claude Code CLI 未安装</h3>
          <p className="text-sm font-medium text-amber-700 mb-4 leading-relaxed">
            AI 聊天功能需要 Claude Code CLI。请按照以下说明安装：
          </p>
          <div className="bg-white/80 backdrop-blur-md rounded-[20px] border border-amber-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 border-b border-amber-200/50">
              <div className="flex items-center gap-2">
                <Download size={14} className="text-amber-700" />
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">安装命令</span>
              </div>
            </div>
            <pre className="p-4 text-sm text-slate-800 overflow-x-auto">
              <code>{instructions}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
