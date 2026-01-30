# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 web application scaffold optimized for AI-powered development with Z.ai. The app includes a WebSocket-based remote control panel for executing system commands and managing tasks. The architecture consists of a main Next.js frontend and auxiliary "mini-services" that run as separate processes.

**Runtime**: Uses Bun as the package manager and runtime (not Node.js/npm).

## Common Commands

### Development
```bash
bun run dev          # Start dev server on port 3000 (logs to dev.log)
bun run lint         # Run ESLint
```

### Production Build & Run
```bash
bun run build        # Build Next.js standalone output
bun start            # Start production server (logs to server.log)
```

### Database (Prisma + SQLite)
```bash
bun run db:push      # Push schema changes to database
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Create and run migrations
bun run db:reset     # Reset database (dev only)
```

### Full Build & Deploy (using .zscripts)
```bash
# From .zscripts/ - builds Next.js + mini-services into a deployable tarball
sh build.sh

# Starts all services: Next.js (3000), mini-services (3003), Caddy (81)
sh start.sh
```

## Architecture

### Multi-Service Architecture

The application consists of multiple services coordinated via [Caddy](Caddyfile):

1. **Next.js App** (port 3000) - Main web application with App Router
2. **claude-code-control** (port 3003) - WebSocket service for remote command execution
3. **ai-orchestrator** (port 3004) - WebSocket service for Claude Code CLI integration
4. **Caddy** (port 81) - Reverse proxy with `XTransformPort` query parameter support for routing WebSocket connections

The Caddy configuration allows the Next.js app to connect to WebSocket services via query parameter: `io('/?XTransformPort=3003')`

### Directory Structure

```
src/
├── app/              # Next.js App Router (pages, layouts, API routes)
│   ├── api/          # API routes (currently has a placeholder route.ts)
│   ├── layout.tsx    # Root layout with fonts and metadata
│   └── page.tsx      # Main page - Claude Code Control Panel UI
├── components/
│   └── ui/           # shadcn/ui components (Radix UI primitives)
├── hooks/            # Custom React hooks
└── lib/
    ├── db.ts         # Prisma client singleton (dev: global, prod: instance)
    └── utils.ts      # Utility functions

skills/               # Skill definitions for AI capabilities (LLM, VLM, PDF, etc.)
mini-services/        # Auxiliary services (separate Bun processes)
├── claude-code-control/  # WebSocket service for remote shell execution
prisma/               # Database schema and migrations
.zscripts/            # Build and deployment scripts
```

### Key Components

- **Prisma**: ORM configured for SQLite with `User` and `Post` models
- **shadcn/ui**: Pre-built components in `src/components/ui/` (no CLI needed - components already exist)
- **Socket.IO Client**: Used in [src/app/page.tsx](src/app/page.tsx) for WebSocket communication
- **z-ai-web-dev-sdk**: AI SDK for backend LLM/chat features (NEVER use in client-side code)

### Mini-Services

The `mini-services/claude-code-control/` service:
- Runs as a separate Bun process on port 3003
- Executes shell commands via Socket.IO events
- Provides system status monitoring (CPU, memory, uptime)
- Defines tasks like `build-project`, `run-tests`, `system-check`

The `mini-services/ai-orchestrator/` service:
- Runs on port 3004
- Connects to local Claude Code CLI via child_process
- Provides WebSocket interface for chat interactions
- Parses CLI output into structured messages

Usage:
- Start: `cd mini-services/ai-orchestrator && bun run dev`
- Socket.IO path: `/ai-orchestrator`
- Chat UI: Navigate to `/chat` route in Next.js app

When adding new mini-services:
1. Create a new subdirectory in `mini-services/`
2. Add `package.json` with `bun`-compatible scripts
3. Build scripts will auto-discover new services (no manual update needed)
4. Configure Caddy routing if needed

## Skills System

The `skills/` directory contains reusable skill definitions for AI capabilities. Each skill has a `SKILL.md` file with documentation and examples. These are reference implementations for various AI tasks:

- **LLM**: Chat completions and conversational AI
- **VLM**: Vision/language models
- **pdf**, **pptx**, **xlsx**, **docx**: Document processing
- **ASR**, **TTS**: Speech recognition and synthesis
- **image-generation**, **video-generation**: Media generation
- **web-reader**, **web-search**: Web utilities

Skills use the `z-ai-web-dev-sdk` package which must only be imported in backend code.

## Next.js Configuration

- **Output mode**: Standalone (for Docker/containerized deployments)
- **TypeScript**: Build errors are ignored (`ignoreBuildErrors: true`)
- **Strict mode**: Disabled
- See [next.config.ts](next.config.ts)

## Database

- **Provider**: SQLite (file: `db/` directory)
- **ORM**: Prisma
- **Client singleton**: [src/lib/db.ts](src/lib/db.ts) (prevents multiple instances in dev)
- Schema location: [prisma/schema.prisma](prisma/schema.prisma)

## Development Notes

- Always use `bun` commands, not `npm`
- The app connects to the WebSocket service using `XTransformPort` query parameter
- shadcn/ui components are pre-installed - use them directly without running the CLI
- When modifying Prisma schema, run `bun run db:generate` before `bun run db:push`
- Build scripts are in Chinese and designed for a specific deployment environment (`/home/z/my-project`)
