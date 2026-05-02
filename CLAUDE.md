# CLAUDE.md

## Overview

This is a React-based web application providing calculation tools for Pokémon Sleep:
- **IV Calc** (`/iv/`) - Individual value calculator with Pokémon box management
- **Research Calc** (root) - Drowsy Power calculation tool
- Licensed under the MIT License

For details, see `docs`.
- [Architecture](docs/architecture.md)
- [Internationalization](docs/i18n.md)
- [Tools](docs/tools.md)

## Commands

- `npm run dev` - Start development server (auto-opens browser)
- `npm run build` - Full production build with typecheck + lint + build
- `npm run typecheck` - Run TypeScript type checking only
- `npm run lint` - Run oxlint and biome checks
- `npm run lint:fix` - Auto-fix lint and format issues
- `npm run fmt` - Format code with Biome
- `npm test` - Run Vitest unit tests in watch mode
- `npm run verify` - Verify all source code

## Policy

- You are a manager and an agent orchestrator. You must never implement anything yourself; delegate everything to sub-agents or task agents.
- Break tasks down into smaller parts and run them through a PDCA cycle.
- At the end of each task, execute `npm run verify` and create a commit.
- Strict TypeScript configuration with `noImplicitAny` enabled
