# Web 端 Claude Code 远程控制系统设计文档

**日期**: 2025-01-29
**版本**: 1.0

## 项目概述

开发一个 Web 端的 Claude Code 控制系统，支持远程输入指令、实时进度提醒和 AI 对话交互。系统直接使用本机的 Claude Code CLI，提供完全自主的任务执行能力。

## 核心目标

- ✅ 增强现有功能：任务队列、文件浏览、实时日志
- ✅ 优化用户体验：改进 UI/UX，更美观易用
- ✅ 添加新交互方式：对话式界面、思维链展示、任务可视化
- ✅ 集成 AI 对话系统：使用本机 Claude Code CLI，支持自然语言交互

---

## 系统架构

### 整体架构

采用**多层微服务架构**：

```
┌─────────────────────────────────────────┐
│           前端层 (Next.js)              │
│  ┌──────────┬──────────┬──────────────┐ │
│  │ 聊天界面  │ 思维链   │ 任务可视化   │ │
│  └──────────┴──────────┴──────────────┘ │
└─────────────────────────────────────────┘
                 ↕ WebSocket
┌─────────────────────────────────────────┐
│         API 网关层 (Next.js API)         │
│    认证/授权/速率限制/请求路由            │
└─────────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────────┐
│       AI Orchestrator Service           │
│  ┌──────────────┬──────────────────────┐│
│  │Claude Code   │ 多模型支持 (备用)     ││
│  │CLI 集成      │ Claude/OpenAI/本地   ││
│  └──────────────┴──────────────────────┘│
└─────────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────────┐
│      Task Execution Service             │
│  ┌────────┬──────────┬────────────────┐ │
│  │任务队列 │ 沙箱执行 │ 文件系统操作    │ │
│  └────────┴──────────┴────────────────┘ │
└─────────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────────┐
│      监控和日志服务                      │
│    实时日志流/性能监控/错误追踪          │
└─────────────────────────────────────────┘
```

### 前端核心组件

**1. ChatInterface 组件**
- 聊天气泡式布局，区分用户消息和 AI 消复
- 支持文本、代码块、文件预览等富文本内容
- 消息流式渲染（AI 回复逐字显示）
- 消息历史持久化（LocalStorage + 数据库）

**2. ThinkingChain 组件**
- 可折叠的思维链展示区域
- 显示 AI 的推理步骤（步骤编号、描述、状态）
- 支持步骤展开/折叠查看详细信息
- 视觉区分思考阶段（草稿、分析、决策）

**3. TaskVisualizer 组件**
- 当前任务卡片（任务名称、状态、进度条）
- 步骤列表（可点击查看详情）
- 子任务树状结构
- 任务统计面板（总耗时、成功率等）

**4. CommandTerminal 组件**
- 增强的终端界面（保留现有功能）
- 实时命令输出流
- 语法高亮（支持 JSON、日志）
- 命令历史搜索

**5. ModelSelector 组件**
- 模型选择下拉菜单（Claude、GPT-4、本地模型）
- API 配置界面（Endpoint、API Key）
- 模型参数调整（温度、最大 token 等）

### 后端核心服务

**AI Orchestrator Service**
- **Claude Code CLI 适配器**：通过 child_process 调用本机 Claude Code
- **模型适配器层**：统一不同 AI 提供商的接口（备用）
- **对话管理器**：会话状态、上下文窗口管理
- **思维链生成器**：引导 AI 展示推理过程
- **任务规划器**：将用户意图拆解为可执行步骤

**Task Execution Service**
- **任务队列**：支持并发执行
- **命令执行器**：安全的 Shell 命令执行（沙箱环境）
- **文件操作器**：受限的文件系统访问
- **进度管理器**：实时进度更新

---

## Claude Code CLI 集成方案

### 集成方式

**主方案：子进程调用**
```typescript
import { spawn } from 'child_process';

const claudeProcess = spawn('claude', ['--interactive'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: projectDir
});

claudeProcess.stdin.write(userMessage);
claudeProcess.stdout.on('data', (data) => {
  // 解析输出并推送到前端
});
```

**备用方案：混合模式**
- 简单任务：直接调用 Claude Code CLI
- 复杂任务：通过 API（如果有 API Key）
- CLI 执行失败：降级到 API 模式

### 输出解析策略

Claude Code CLI 输出格式（待确认）：
```
<thinking>
步骤 1: 分析需求...
步骤 2: 查看文件...
步骤 3: 执行命令...
</thinking>

<execute>
命令: git status
输出:...
</execute>

<result>
任务完成，已创建 3 个文件...
</result>
```

解析器会识别这些标签并分类：
- `<thinking>` → 思维链组件
- `<execute>` → 任务可视化组件
- `<result>` → 聊天消息

---

## 数据流和交互

### 用户交互流程

```
用户输入消息
    ↓
ChatInterface 组件
    ↓
WebSocket → AI Orchestrator Service
    ↓
调用本机 Claude Code CLI
    ↓
Claude Code 执行并返回结果
    ↓
解析输出（思维链、命令、文件操作）
    ↓
WebSocket 实时推送到前端
    ↓
更新 UI（对话、思维链、任务进度）
```

### 数据结构

**Message（消息）**
```typescript
interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  thinking?: ThinkingStep[]  // 思维链
  artifacts?: Artifact[]     // 生成的文件/代码
}
```

**ThinkingStep（思维步骤）**
```typescript
interface ThinkingStep {
  id: string
  stepNumber: number
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  details?: string
  duration?: number
}
```

**Task（任务）**
```typescript
interface Task {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number  // 0-100
  steps: TaskStep[]
  startTime: Date
  endTime?: Date
}
```

---

## 错误处理和安全机制

### 错误处理策略

**Claude Code CLI 错误**
- CLI 未安装 → 提供安装指引
- CLI 执行失败 → 显示详细错误，提供重试
- 超时处理 → 显示进度，允许取消
- 输出解析失败 → 回退到原始输出

**任务执行错误**
- 命令执行失败 → 捕获 stderr，显示错误堆栈
- 文件操作失败 → 友好的错误提示
- 网络错误 → WebSocket 断线重连
- 沙箱违规 → 阻止操作，记录日志

### 安全机制

**1. 命令执行沙箱**
- 白名单机制：仅允许安全命令（ls, cd, git, npm, bun 等）
- 路径限制：限制在项目目录内
- 命令超时：防止资源占用
- 资源限制：CPU、内存限制

**2. 文件操作限制**
- 允许的目录：仅限项目根目录及子目录
- 禁止的路径：/etc, /root, 系统配置文件
- 文件大小限制：防止处理超大文件
- 操作审计：记录所有文件操作

**3. 用户确认机制**
危险操作需要用户确认：
- 删除文件/目录
- 修改系统配置
- 安装/卸载包
- Git 强制推送
- 数据库操作

---

## 技术栈

### 前端
- React 19 + Next.js 16（已有）
- TypeScript（已有）
- Socket.IO Client（已有）
- shadcn/ui（已有）
- TanStack Query（状态管理）
- React Markdown（代码高亮）
- Framer Motion（动画）

### 后端
- Bun 运行时（已有）
- Socket.IO（已有）
- child_process（调用 Claude Code CLI）
- BullMQ（任务队列，可选）
- Zod（数据验证）

### Claude Code 集成
- `claude` CLI 命令（本机安装）
- stdin/stdout 通信
- 输出流式解析

---

## 实现计划

### 阶段 1：基础架构
1. 创建 AI Orchestrator Service（新 mini-service）
2. 实现与本机 Claude Code 的通信接口
3. 扩展前端聊天界面组件
4. 建立 WebSocket 消息协议

### 阶段 2：核心功能
1. 实现思维链展示组件
2. 实现任务可视化组件
3. Claude Code 命令执行的实时反馈
4. 错误处理和降级机制

### 阶段 3：增强功能
1. 多模型支持（API 备用模式）
2. 任务历史和会话管理
3. 文件浏览和管理界面
4. 实时日志查看

### 阶段 4：优化和完善
1. 安全沙箱实现
2. 性能优化
3. 用户体验优化
4. 文档和测试

---

## 目录结构

```
src/
├── app/
│   ├── page.tsx (现有 - 更新为包含聊天界面)
│   └── api/
│       └── ai/ (新的 API routes)
├── components/
│   ├── chat/ (新建)
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ThinkingChain.tsx
│   ├── tasks/ (新建)
│   │   ├── TaskVisualizer.tsx
│   │   ├── TaskCard.tsx
│   │   └── StepList.tsx
│   └── terminal/ (现有 - 保留)
└── lib/
    └── claude-connector.ts (新建 - Claude Code CLI 通信)

mini-services/
├── claude-code-control/ (现有 - 保留)
└── ai-orchestrator/ (新建)
    ├── index.ts (主服务)
    ├── claude-cli.ts (Claude Code CLI 适配器)
    ├── task-queue.ts (任务队列)
    └── sandbox.ts (沙箱执行环境)
```

---

## 成功标准

- ✅ 用户可以通过 Web 界面与 Claude Code 对话
- ✅ 显示 Claude Code 的思维链和推理过程
- ✅ 实时可视化任务执行进度
- ✅ 安全地执行命令和文件操作
- ✅ 友好的错误处理和用户提示
- ✅ 响应式界面，支持移动端访问

---

## 后续优化方向

- 支持语音控制输入
- 可视化编程/拖拽式工作流
- 团队协作功能（多用户会话）
- 云端部署和远程访问
- 插件系统（扩展功能）
