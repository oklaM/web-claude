import { spawn } from 'child_process';

export interface ClaudeMessage {
  type: 'thinking' | 'command' | 'result' | 'error';
  content: string;
  metadata?: Record<string, unknown>;
}

export class ClaudeCLIConnector {
  private process: ReturnType<typeof spawn> | null = null;
  private messageHandlers: ((message: ClaudeMessage) => void)[] = [];

  constructor(private cwd: string = process.cwd()) {}

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.process = spawn('claude', ['--interactive'], {
          cwd: this.cwd,
          stdio: ['pipe', 'pipe', 'pipe'],
        });

        this.process.stdout?.on('data', (data: Buffer) => {
          this.parseOutput(data.toString());
        });

        this.process.stderr?.on('data', (data: Buffer) => {
          this.notify({
            type: 'error',
            content: data.toString(),
          });
        });

        this.process.on('error', (error) => {
          this.notify({
            type: 'error',
            content: `CLI process error: ${error.message}`,
          });
          reject(error);
        });

        // Wait a moment for the process to start
        setTimeout(resolve, 500);
      } catch (error) {
        reject(error);
      }
    });
  }

  sendMessage(message: string): void {
    if (!this.process?.stdin) {
      throw new Error('CLI process not running');
    }
    this.process.stdin.write(message + '\n');
  }

  onMessage(handler: (message: ClaudeMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  private parseOutput(output: string): void {
    // Simple parsing - will be enhanced later
    const lines = output.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.startsWith('<thinking>')) {
        this.notify({ type: 'thinking', content: line });
      } else if (line.startsWith('<execute>')) {
        this.notify({ type: 'command', content: line });
      } else if (line.startsWith('<result>')) {
        this.notify({ type: 'result', content: line });
      } else {
        this.notify({ type: 'result', content: line });
      }
    }
  }

  private notify(message: ClaudeMessage): void {
    for (const handler of this.messageHandlers) {
      handler(message);
    }
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}
