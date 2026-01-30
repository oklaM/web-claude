export async function checkClaudeCLI(): Promise<boolean> {
  try {
    const process = Bun.spawn(['which', 'claude'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const output = await new Response(process.stdout).text();
    await process.exited;

    return output.trim().length > 0;
  } catch {
    return false;
  }
}

export function getClaudeInstallInstructions(): string {
  return `
# Claude Code CLI Installation

The Claude Code CLI is required for AI chat functionality.

## Install via npm:
npm install -g @anthropic-ai/claude-code

## Or via bun:
bun install -g @anthropic-ai/claude-code

## After installation:
1. Restart this application
2. Click "Start Claude" in the chat interface

## Documentation:
https://docs.anthropic.com/en/docs/claude-code/overview
  `.trim();
}
