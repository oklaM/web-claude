'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Terminal,
  Play,
  Square,
  RefreshCw,
  Wifi,
  WifiOff,
  Cpu,
  HardDrive,
  Activity,
  FileCode,
  Command,
  Clock,
  ChevronRight,
  Power,
  Settings,
  MessageSquare
} from 'lucide-react';

type TerminalMessage = {
  id: string;
  content: string;
  type: 'command' | 'output' | 'error' | 'info';
  timestamp: Date;
};

type SystemStatus = {
  connected: boolean;
  status: 'idle' | 'running' | 'stopped' | 'error';
  uptime?: string;
  memory?: string;
  cpu?: string;
};

const quickCommands = [
  { label: 'Status', command: '/status' },
  { label: 'Help', command: '/help' },
  { label: 'Clear', command: '/clear' },
  { label: 'Restart', command: '/restart' },
];

const predefinedTasks = [
  { id: 1, name: 'System Check', command: 'system-check', icon: Activity },
  { id: 2, name: 'Build Project', command: 'build-project', icon: FileCode },
  { id: 3, name: 'Run Tests', command: 'run-tests', icon: Terminal },
  { id: 4, name: 'Deploy', command: 'deploy', icon: Power },
];

export default function ClaudeCodeControl() {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [terminalMessages, setTerminalMessages] = useState<TerminalMessage[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    connected: false,
    status: 'idle',
  });
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');

  const addTerminalMessage = (content: string, type: TerminalMessage['type']) => {
    const newMessage: TerminalMessage = {
      id: `${Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      type,
      timestamp: new Date(),
    };
    setTerminalMessages((prev) => [...prev, newMessage]);
  };

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io('http://localhost:3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setSystemStatus((prev) => ({ ...prev, connected: true }));
      addTerminalMessage('Connected to Claude Code Control Server', 'info');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      setSystemStatus((prev) => ({ ...prev, connected: false }));
      addTerminalMessage('Disconnected from server', 'error');
    });

    socketInstance.on('command-output', (data: { output: string; type: string }) => {
      addTerminalMessage(data.output, data.type as any);
    });

    socketInstance.on('system-status', (status: SystemStatus) => {
      setSystemStatus(status);
    });

    socketInstance.on('task-progress', (data: { task: string; progress: number }) => {
      addTerminalMessage(`Task "${data.task}": ${data.progress}% complete`, 'info');
    });

    socketInstance.on('task-complete', (data: { task: string; success: boolean }) => {
      addTerminalMessage(
        `Task "${data.task}" ${data.success ? 'completed successfully' : 'failed'}`,
        data.success ? 'info' : 'error'
      );
      setActiveTask(null);
    });

    // Add initial welcome message
    addTerminalMessage('Claude Code Remote Control Panel', 'info');
    addTerminalMessage('Type /help for available commands', 'info');

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendCommand = (command: string) => {
    if (!command.trim()) return;

    addTerminalMessage(`> ${command}`, 'command');
    socket?.emit('execute-command', { command });
    setCommandInput('');

    if (command.startsWith('/')) {
      handleSystemCommand(command);
    }
  };

  const handleSystemCommand = (command: string) => {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case '/clear':
        setTerminalMessages([]);
        break;
      case '/status':
        socket?.emit('get-status');
        break;
      case '/help':
        addTerminalMessage('Available commands:', 'info');
        addTerminalMessage('  /status  - Get system status', 'info');
        addTerminalMessage('  /clear   - Clear terminal', 'info');
        addTerminalMessage('  /help    - Show this help message', 'info');
        addTerminalMessage('  /restart - Restart the system', 'info');
        break;
      case '/restart':
        addTerminalMessage('Restarting system...', 'info');
        socket?.emit('restart');
        break;
      default:
        addTerminalMessage(`Unknown command: ${cmd}`, 'error');
    }
  };

  const executeTask = (task: { id: number; name: string; command: string }) => {
    addTerminalMessage(`Starting task: ${task.name}`, 'info');
    setActiveTask(task.name);
    socket?.emit('execute-task', { task: task.command, taskId: task.id });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCommand(commandInput);
    }
  };

  const getMessageColor = (type: TerminalMessage['type']) => {
    switch (type) {
      case 'command':
        return 'text-green-600 font-semibold';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-900';
    }
  };

  const getStatusBadgeColor = () => {
    switch (systemStatus.status) {
      case 'running':
        return 'bg-green-500';
      case 'stopped':
        return 'bg-red-500';
      case 'error':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Terminal className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Claude Code Remote Control</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="outline" className="flex items-center space-x-1">
                <span className={`w-2 h-2 rounded-full ${getStatusBadgeColor()}`} />
                <span className="capitalize">{systemStatus.status}</span>
              </Badge>
            </div>
            <Badge
              variant={isConnected ? 'default' : 'destructive'}
              className="flex items-center space-x-1"
            >
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </Badge>
            <Link href="/chat">
              <Button variant="default" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Open AI Chat</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Left Sidebar - Quick Actions */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Command className="h-4 w-4" />
                  <span className="text-sm">Quick Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {predefinedTasks.map((task) => {
                  const Icon = task.icon;
                  return (
                    <Button
                      key={task.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => executeTask(task)}
                      disabled={activeTask !== null}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="flex-1 text-left">{task.name}</span>
                      {activeTask === task.name && (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      )}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">System Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Cpu className="h-4 w-4 mr-2" />
                    CPU
                  </span>
                  <span className="font-medium">{systemStatus.cpu || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Memory
                  </span>
                  <span className="font-medium">{systemStatus.memory || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Uptime
                  </span>
                  <span className="font-medium">{systemStatus.uptime || 'N/A'}</span>
                </div>
                <Separator />
                <Button variant="outline" className="w-full" size="sm">
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Refresh Status
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center - Terminal */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4" />
                    <span className="text-sm">Terminal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTerminalMessages([])}
                    >
                      Clear
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-4">
                <ScrollArea className="flex-1 h-[400px] w-full border rounded-md bg-muted p-4">
                  <div className="font-mono text-sm space-y-1">
                    {terminalMessages.map((msg) => (
                      <div key={msg.id} className="flex items-start space-x-2">
                        <span className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={getMessageColor(msg.type)}>{msg.content}</span>
                      </div>
                    ))}
                    {terminalMessages.length === 0 && (
                      <p className="text-muted-foreground text-center">
                        No messages yet. Start by typing a command below.
                      </p>
                    )}
                  </div>
                </ScrollArea>

                {/* Quick Commands */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {quickCommands.map((qc) => (
                    <Button
                      key={qc.label}
                      variant="secondary"
                      size="sm"
                      onClick={() => sendCommand(qc.command)}
                      disabled={!isConnected}
                    >
                      {qc.label}
                    </Button>
                  ))}
                </div>

                {/* Command Input */}
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                  <Textarea
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a command... (Press Enter to send, Shift+Enter for new line)"
                    className="min-h-[60px] resize-none font-mono text-sm"
                    disabled={!isConnected}
                  />
                  <Button
                    onClick={() => sendCommand(commandInput)}
                    disabled={!isConnected || !commandInput.trim()}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>© 2025 Claude Code Control</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Build {process.env.NEXT_PUBLIC_BUILD_VERSION || '1.0.0'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>System Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
