import { z } from 'zod';

export const ThinkingStepSchema = z.object({
  id: z.string(),
  stepNumber: z.number(),
  description: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  details: z.string().optional(),
  duration: z.number().optional(),
});

export const ArtifactSchema = z.object({
  id: z.string(),
  type: z.enum(['file', 'code', 'command_output']),
  content: z.string(),
  filePath: z.string().optional(),
  language: z.string().optional(),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.date(),
  thinking: z.array(ThinkingStepSchema).optional(),
  artifacts: z.array(ArtifactSchema).optional(),
});

export const ClaudeSocketMessageSchema = z.object({
  type: z.enum(['thinking', 'command', 'result', 'error']),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
});
