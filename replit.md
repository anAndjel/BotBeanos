# BotBeanos - Discord Bot

## Overview
A Discord bot built with TypeScript and discord.js v14. Uses prefix commands (!) for moderation and utility functions.

## Project Architecture
- **Runtime**: Node.js 20 with tsx for TypeScript execution
- **Language**: TypeScript (ESM modules)
- **Framework**: discord.js v14
- **Entry Point**: `src/index.ts`

## Project Structure
```
src/
  index.ts              - Main bot entry point
  types/command.ts      - Command interface definition
  handlers/loadCommands.ts - Dynamic command loader
  commands/             - Individual command files (ban, kick, clear, ping, timeout, nig)
  events/               - Event handlers (messageCreate)
```

## Configuration
- Bot token stored as secret `TOKEN`
- Commands use `!` prefix
- Bot requires Guilds, GuildMessages, and MessageContent intents

## Running
- Workflow: `npx tsx src/index.ts`
- The bot is a background process (no web frontend)
