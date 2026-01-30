import { createServer } from 'http';
import { Server } from 'socket.io';
import { ClaudeCLIConnector } from './claude-cli.js';

const httpServer = createServer();
const io = new Server(httpServer, {
  path: '/ai-orchestrator',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Store active CLI connector per socket
const connectors = new Map<string, ClaudeCLIConnector>();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Create connector for this session
  const connector = new ClaudeCLIConnector();
  connectors.set(socket.id, connector);

  // Forward CLI messages to client
  connector.onMessage((message) => {
    socket.emit('claude-message', message);
  });

  // Handle client messages
  socket.on('user-message', async (data: { message: string }) => {
    try {
      console.log(`Sending to Claude: ${data.message}`);
      connector.sendMessage(data.message);
    } catch (error) {
      socket.emit('claude-message', {
        type: 'error',
        content: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Handle start request
  socket.on('start-claude', async () => {
    try {
      await connector.start();
      socket.emit('claude-status', { status: 'connected' });
    } catch (error) {
      socket.emit('claude-message', {
        type: 'error',
        content: `Failed to start Claude CLI: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  // Handle stop request
  socket.on('stop-claude', async () => {
    try {
      await connector.stop();
      socket.emit('claude-status', { status: 'disconnected' });
    } catch (error) {
      socket.emit('claude-message', {
        type: 'error',
        content: `Failed to stop Claude CLI: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  socket.on('disconnect', async () => {
    console.log(`Client disconnected: ${socket.id}`);
    const connector = connectors.get(socket.id);
    if (connector) {
      await connector.stop();
      connectors.delete(socket.id);
    }
  });
});

const PORT = 3004;
httpServer.listen(PORT, () => {
  console.log(`AI Orchestrator service running on port ${PORT}`);
});
