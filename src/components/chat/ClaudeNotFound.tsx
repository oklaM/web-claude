'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal } from 'lucide-react';
import { getClaudeInstallInstructions } from '@/lib/claude-detection';

export function ClaudeNotFound() {
  const instructions = getClaudeInstallInstructions();

  return (
    <Card className="p-6 bg-orange-50 dark:bg-orange-950">
      <div className="flex items-start space-x-3">
        <Terminal className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Claude Code CLI Not Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            The Claude Code CLI is required for AI chat functionality. Please install it using the instructions below.
          </p>
          <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
            <code>{instructions}</code>
          </pre>
        </div>
      </div>
    </Card>
  );
}
