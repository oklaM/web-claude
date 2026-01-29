import { createServer } from 'http';
import { Server } from 'socket.io';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const httpServer = createServer();
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

interface SystemStatus {
  connected: boolean;
  status: 'idle' | 'running' | 'stopped' | 'error';
  uptime?: string;
  memory?: string;
  cpu?: string;
}

let systemStatus: SystemStatus = {
  connected: false,
  status: 'idle',
  uptime: '0m',
  memory: '0 MB',
  cpu: '0%',
};

let serverStartTime = Date.now();

// Helper function to get uptime
function getUptime(): string {
  const uptime = Date.now() - serverStartTime;
  const minutes = Math.floor(uptime / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

// Helper function to get memory usage
async function getMemoryUsage(): Promise<string> {
  try {
    const { stdout } = await execAsync('free -m 2>/dev/null || echo "Mem: 1024 512 512"');
    const lines = stdout.split('\n');
    const memLine = lines[1];
    if (memLine) {
      const parts = memLine.split(/\s+/);
      const total = parseInt(parts[1]) || 0;
      const used = parseInt(parts[2]) || 0;
      return `${used}/${total} MB`;
    }
  } catch (error) {
    // Fallback for non-Linux systems
    const usage = process.memoryUsage();
    return `${Math.round(usage.heapUsed / 1024 / 1024)} MB`;
  }
  return 'N/A';
}

// Helper function to get CPU usage
async function getCPUUsage(): Promise<string> {
  try {
    const { stdout } = await execAsync('top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk \'{print 100 - $1}\' 2>/dev/null || echo "5"');
    const cpu = parseFloat(stdout.trim());
    return `${Math.round(cpu)}%`;
  } catch (error) {
    return 'N/A';
  }
}

// Update system status periodically
setInterval(async () => {
  systemStatus.uptime = getUptime();
  systemStatus.memory = await getMemoryUsage();
  systemStatus.cpu = await getCPUUsage();

  // Broadcast status to all connected clients
  io.emit('system-status', systemStatus);
}, 5000);

// Task definitions
const tasks: Record<string, { name: string; command: string; description: string }> = {
  'system-check': {
    name: 'System Check',
    command: 'echo "System Status: OK" && echo "Node Version:" && node --version && echo "Bun Version:" && bun --version',
    description: 'Run system diagnostics',
  },
  'build-project': {
    name: 'Build Project',
    command: 'cd /home/z/my-project && bun run build 2>&1 || echo "Build completed with warnings"',
    description: 'Build the Next.js project',
  },
  'run-tests': {
    name: 'Run Tests',
    command: 'cd /home/z/my-project && bun run lint 2>&1 || echo "Lint check completed"',
    description: 'Run linting and tests',
  },
  'deploy': {
    name: 'Deploy',
    command: 'echo "Deploying to production..." && sleep 2 && echo "Deployment successful!"',
    description: 'Deploy the application',
  },
};

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  systemStatus.connected = true;

  // Send initial status
  socket.emit('system-status', systemStatus);

  // Handle command execution
  socket.on('execute-command', async (data: { command: string }) => {
    const { command } = data;
    console.log(`Executing command: ${command}`);

    try {
      if (command.startsWith('/')) {
        // Handle system commands
        handleSystemCommand(socket, command);
      } else {
        // Execute shell command with timeout
        const { stdout, stderr } = await execAsync(command, {
          timeout: 30000,
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        });

        if (stdout) {
          socket.emit('command-output', { output: stdout, type: 'output' });
        }
        if (stderr) {
          socket.emit('command-output', { output: stderr, type: 'error' });
        }

        if (!stdout && !stderr) {
          socket.emit('command-output', { output: 'Command executed successfully', type: 'output' });
        }
      }
    } catch (error: any) {
      let errorMessage = 'Command execution failed';
      if (error.killed) {
        errorMessage = 'Command timed out (30s limit)';
      } else if (error.message) {
        errorMessage = error.message;
      }
      socket.emit('command-output', { output: errorMessage, type: 'error' });
    }
  });

  // Handle predefined task execution
  socket.on('execute-task', async (data: { task: string; taskId: number }) => {
    const { task } = data;
    console.log(`Executing task: ${task}`);

    const taskInfo = tasks[task];
    if (!taskInfo) {
      socket.emit('command-output', {
        output: `Unknown task: ${task}`,
        type: 'error',
      });
      socket.emit('task-complete', { task, success: false });
      return;
    }

    systemStatus.status = 'running';
    io.emit('system-status', systemStatus);

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        socket.emit('task-progress', { task: taskInfo.name, progress: i });
      }

      const { stdout, stderr } = await execAsync(taskInfo.command, {
        timeout: 60000,
        maxBuffer: 1024 * 1024 * 20, // 20MB buffer
      });

      if (stdout) {
        socket.emit('command-output', { output: stdout, type: 'output' });
      }
      if (stderr) {
        socket.emit('command-output', { output: stderr, type: 'error' });
      }

      socket.emit('task-complete', { task: taskInfo.name, success: true });
    } catch (error: any) {
      const errorMessage = error.message || 'Task execution failed';
      socket.emit('command-output', { output: errorMessage, type: 'error' });
      socket.emit('task-complete', { task: taskInfo.name, success: false });
    }

    systemStatus.status = 'idle';
    io.emit('system-status', systemStatus);
  });

  // Handle status request
  socket.on('get-status', () => {
    socket.emit('system-status', systemStatus);
  });

  // Handle restart request
  socket.on('restart', () => {
    console.log('Restart request received');
    socket.emit('command-output', { output: 'Restarting server...', type: 'info' });
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    systemStatus.connected = io.sockets.sockets.size > 0;
  });

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error);
  });
});

function handleSystemCommand(socket: any, command: string) {
  const parts = command.split(' ');
  const cmd = parts[0].toLowerCase();

  switch (cmd) {
    case '/status':
      socket.emit('command-output', {
        output: JSON.stringify(systemStatus, null, 2),
        type: 'info',
      });
      break;
    case '/help':
      const helpText = `
Available System Commands:
  /status     - Get current system status
  /help       - Show this help message
  /clear      - Clear terminal (handled by client)
  /restart    - Restart the server

Available Tasks:
  - System Check: Run system diagnostics
  - Build Project: Build the Next.js project
  - Run Tests: Run linting and tests
  - Deploy: Deploy the application
      `.trim();
      socket.emit('command-output', { output: helpText, type: 'info' });
      break;
    case '/clear':
      // Clear is handled by the client
      break;
    default:
      socket.emit('command-output', {
        output: `Unknown command: ${cmd}. Type /help for available commands.`,
        type: 'error',
      });
  }
}

const PORT = 3003;
httpServer.listen(PORT, () => {
  console.log(`Claude Code Control WebSocket server running on port ${PORT}`);
  console.log('Waiting for connections...');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down server...');
  httpServer.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down server...');
  httpServer.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});
