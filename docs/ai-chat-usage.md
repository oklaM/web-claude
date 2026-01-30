# AI Chat Interface Usage Guide

## Starting the AI Chat

1. Start all mini-services:
   ```bash
   cd .zscripts
   sh mini-services-start.sh
   ```

2. Start Next.js dev server:
   ```bash
   bun run dev
   ```

3. Navigate to http://localhost:3000
4. Click "Open AI Chat" button

## Using the Chat

### Starting Claude CLI
1. Click "Start Claude" button in chat interface
2. Wait for connection to establish
3. Status will show "Connected to Claude CLI"

### Sending Messages
- Type in the text area at bottom
- Press Enter to send (Shift+Enter for new line)
- Claude will respond in the chat interface

### Features
- **Thinking Chain**: See Claude's reasoning process
- **Real-time Updates**: Watch as Claude processes your request
- **Error Handling**: Clear error messages if something goes wrong

## Troubleshooting

### "Claude Code CLI Not Found"
Install the CLI:
```bash
npm install -g @anthropic-ai/claude-code
# or
bun install -g @anthropic-ai/claude-code
```

### "Failed to start Claude CLI"
1. Check Claude is installed: `which claude`
2. Check CLI version: `claude --version`
3. Restart the services

### No response from Claude
1. Check AI Orchestrator is running on port 3004
2. Check browser console for errors
3. Try restarting Claude connection

## Architecture

- **Frontend**: Next.js app with Socket.IO client
- **Backend**: ai-orchestrator service (port 3004)
- **Bridge**: Claude Code CLI via child_process
