# 🤖 Web Claude Code Control Panel

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Bun](https://img.shields.io/badge/Bun-1.3+-FF6F6F?style=flat-square&logo=bun)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**现代化的 Web AI 助手控制面板**

实时系统监控 · AI 聊天界面 · 任务执行管理

[功能特性](#-功能特性) · [快速开始](#-快速开始) · [文档](#-文档) · [贡献](#-贡献)

</div>

---

## ✨ 关于

这是一个基于 **Next.js 16** 构建的现代化 Web 应用，提供了一个功能丰富的控制面板，用于管理和与本地 **Claude Code CLI** 进行交互。该项目展示了如何使用最新的 Web 技术栈创建美观、实用的 AI 辅助开发工具。

### 🎯 核心功能

- 🎨 **现代化 UI 设计** - 采用毛玻璃效果和渐变设计的精美界面
- 💬 **AI 聊天界面** - 与 Claude Code CLI 的实时聊天交互
- 📊 **系统监控** - 实时显示 CPU、内存和运行时间
- 🚀 **任务执行** - 远程执行系统命令和预定义任务
- 🌐 **WebSocket 通信** - 基于 Socket.IO 的实时双向通信
- 🎭 **响应式设计** - 完美适配桌面和移动设备

## 🚀 功能特性

### 💬 AI Chat Interface

- **实时对话** - 与本地 Claude Code CLI 进行自然语言交互
- **思考链可视化** - 实时展示 AI 的思考过程
- **优雅的错误处理** - 友好的错误提示和 CLI 安装指引
- **现代化输入** - 浮动式毛玻璃输入栏，支持 Enter 发送
- **智能检测** - 自动检测 Claude CLI 是否安装

### 🎛️ 控制面板

- **系统状态监控** - CPU 使用率、内存占用、运行时间
- **命令执行** - 远程执行 Shell 命令
- **任务管理** - 预定义任务快捷执行（构建、测试、部署）
- **实时输出** - 命令执行结果的实时流式输出
- **服务控制** - 重启服务、查看状态

### 🎨 UI/UX 特色

- **毛玻璃效果** - backdrop-blur 和半透明背景
- **渐变配色** - indigo/purple 现代渐变主题
- **流畅动画** - 平滑的过渡和交互反馈
- **暗色模式支持** - 完整的深色主题
- **移动端优化** - 触摸友好的响应式设计

## 🛠️ 技术栈

### 核心框架
- **[Next.js 16](https://nextjs.org/)** - React 框架（App Router）
- **[React 19](https://react.dev/)** - UI 库
- **[TypeScript 5](https://www.typescriptlang.org/)** - 类型安全
- **[Tailwind CSS 4](https://tailwindcss.com/)** - 样式框架

### UI 组件
- **[shadcn/ui](https://ui.shadcn.com/)** - 高质量组件库
- **[Lucide React](https://lucide.dev/)** - 图标库
- **[Framer Motion](https://www.framer.com/motion/)** - 动画库

### 通信与状态
- **[Socket.IO](https://socket.io/)** - WebSocket 通信
- **[Zustand](https://zustand-demo.pmnd.rs/)** - 状态管理
- **[TanStack Query](https://tanstack.com/query)** - 数据获取

### 后端服务
- **[Bun](https://bun.sh/)** - JavaScript 运行时
- **[Prisma](https://www.prisma.io/)** - ORM
- **[NextAuth.js](https://next-auth.js.org/)** - 认证
- **[Caddy](https://caddyserver.com/)** - 反向代理

## 📦 快速开始

### 前置要求

- **[Bun](https://bun.sh/)** >= 1.3
- **[Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code/overview)**（可选，用于 AI 聊天功能）

### 安装

```bash
# 克隆仓库
git clone https://github.com/oklaM/web-claude.git
cd web-claude

# 安装依赖
bun install

# 安装 Claude Code CLI（可选）
bun install -g @anthropic-ai/claude-code
```

### 开发

```bash
# 启动开发服务器
bun run dev

# 在浏览器中打开
open http://localhost:3000
```

### 构建和部署

```bash
# 构建生产版本
bun run build

# 启动生产服务器
bun start

# 或使用构建脚本
cd .zscripts
sh build.sh
sh start.sh
```

## 📖 使用文档

### AI Chat 功能

1. 访问 `http://localhost:3000`
2. 点击 **"Open AI Chat"** 按钮进入聊天界面
3. 点击 **"启动 Claude"** 连接到本地 Claude CLI
4. 开始与 AI 对话！

详细使用指南请参阅 [docs/ai-chat-usage.md](docs/ai-chat-usage.md)

### 控制面板功能

- **系统监控** - 查看实时系统状态
- **命令执行** - 在终端输入命令并查看输出
- **快捷任务** - 执行预定义的系统任务
- **服务管理** - 重启服务、查看日志

## 📁 项目结构

```
web-claude/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API 路由
│   │   ├── chat/                 # AI 聊天页面
│   │   ├── layout.tsx            # 根布局
│   │   └── page.tsx              # 控制面板主页
│   ├── components/
│   │   ├── chat/                 # 聊天组件
│   │   │   ├── ChatInterface.tsx # 主聊天界面
│   │   │   ├── MessageBubble.tsx # 消息气泡
│   │   │   ├── ThinkingChain.tsx # 思考链
│   │   │   ├── ErrorMessage.tsx  # 错误提示
│   │   │   └── ClaudeNotFound.tsx# CLI 未安装提示
│   │   └── ui/                   # shadcn/ui 组件
│   ├── hooks/                    # 自定义 Hooks
│   └── lib/                      # 工具函数
│       ├── ai-types.ts           # AI 聊天类型
│       ├── ai-validation.ts      # Zod 验证
│       └── claude-detection.ts   # CLI 检测
├── mini-services/                # 辅助服务
│   ├── claude-code-control/      # 控制面板服务（端口 3003）
│   └── ai-orchestrator/          # AI 聊天服务（端口 3004）
├── prisma/                       # 数据库 Schema
├── .zscripts/                    # 构建和部署脚本
├── docs/                         # 项目文档
└── public/                       # 静态资源
```

## 🔧 配置

### Mini-Services

项目使用多个辅助服务，通过 Caddy 反向代理协调：

```bash
# 启动所有服务
cd .zscripts
sh mini-services-start.sh

# 单独启动服务
cd mini-services/claude-code-control
bun run dev

cd mini-services/ai-orchestrator
bun run dev
```

### 环境变量

创建 `.env.local` 文件配置环境变量：

```bash
# 数据库
DATABASE_URL="file:./db/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Claude Code CLI（可选）
CLAUDE_CLI_PATH="/usr/local/bin/claude"
```

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- 添加 TypeScript 类型定义
- 编写清晰的提交信息
- 确保代码通过 ESLint 检查

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Claude](https://www.anthropic.com/claude) - Anthropic 出色的 AI 助手
- [Next.js](https://nextjs.org/) - React 框架
- [shadcn/ui](https://ui.shadcn.com/) - 优美的组件库
- [Bun](https://bun.sh/) - 快速的 JavaScript 运行时

## 📮 联系方式

- **项目主页**: [https://github.com/oklaM/web-claude](https://github.com/oklaM/web-claude)
- **问题反馈**: [GitHub Issues](https://github.com/oklaM/web-claude/issues)

---

<div align="center">

**Built with ❤️ using Next.js & Claude Code**

[⬆ 返回顶部](#-web-claude-code-control-panel)

</div>
