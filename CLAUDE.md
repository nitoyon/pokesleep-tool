# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based web application providing calculation tools for Pokémon Sleep:
- **IV Calculator** (`/iv/`) - Individual value calculator with Pokémon box management
- **Research Calculator** (root) - Drowsy Power calculation tool

The application is built with Vite, TypeScript, React 19, and Material-UI v7, supporting 5 languages (en, ja, ko, zh-CN, zh-TW) via react-i18next.

This project is licensed under the MIT License.

## Development Commands

### Build and Run
- `npm run dev` - Start development server (auto-opens browser)
- `npm run build` - Full production build with typecheck + lint + build
- `npm run typecheck` - Run TypeScript type checking only
- `npm run lint` - Run ESLint checks only
- `npm test` - Run Vitest unit tests in watch mode

### Utility Scripts
- `npm run rpfit` - Run RP fitting script (uses ts-node)
- `npm run rptest` - Run RP testing script (uses ts-node)

## Architecture

### Application Structure

The app uses a **dual-app architecture** with client-side routing:
- `src/ui/App.tsx` - Root component that switches between ResearchCalc and IvCalc based on URL path
- `src/index.tsx` - Entry point handling i18n initialization, error handlers, and PWA setup
- URL-based routing: `/pokesleep-tool/` → Research Calc, `/pokesleep-tool/iv/` → IV Calc

### Two Main Applications

**1. IV Calculator (`src/ui/IvCalc/`)**
- Complex state management using `useReducer` with `IvState` and `IvAction` types defined in `IvState.ts`
- Dual-tab interface: Upper tabs (RP/Strength/Rating) and Lower tabs (Form/Box/Settings)
- Box system for storing multiple Pokémon with localStorage persistence
- State includes: pokemonIv, box, parameter (strength settings), dialog states, tab indices
- Main component: `IvCalcApp.tsx` orchestrates all sub-components and state

**2. Research Calculator (`src/ui/ResearchCalc/`)**
- Simpler state management with useState
- Configuration persisted via `ResearchCalcAppConfig.ts`
- Main component: `ResearchCalcApp.tsx`

### Core Utilities (`src/util/`)

Business logic is separated from UI in utility classes:
- `PokemonIv.ts` - Individual value calculations and Pokémon data management
- `PokemonStrength.ts` - Strength/power calculations (large file, complex logic)
- `PokemonRp.ts` - RP calculations (RP is a term used in Pokémon Sleep)
- `PokemonBox.ts` - Box storage management with localStorage
- `Energy.ts` - Energy-related calculations (large file)
- `Nature.ts`, `SubSkill.ts`, `MainSkill.ts` - Game mechanic utilities
- `Exp.ts`, `Rank.ts` - Level and ranking systems

### Data Layer (`src/data/`)

Static game data loaded from JSON:
- `pokemon.json` - All Pokémon data (largest file)
- `field.json` - Field/area information
- `event.json` - Event bonus data
- `news.json` - App news/announcements
- TypeScript files (`pokemons.ts`, `fields.ts`, `events.ts`) provide typed access to JSON data

### Internationalization

- `src/i18n.ts` - i18next configuration
- `src/i18n/*.json` - Translation files for 5 languages
- Language detection in `index.tsx` based on browser language
- Dynamic font loading per language (M PLUS 1p for default, Noto Sans TC/SC for Chinese)

### Build Configuration

Vite builds 10 HTML entry points (2 apps × 5 languages) with code splitting:
- `mui` chunk - Material-UI and Emotion libraries
- `react` chunk - React and other node_modules
- `resource` chunk - Game data and i18n files

## Key Patterns

### State Management in IvCalc
The IV Calculator uses a reducer pattern with action dispatching. When modifying IvCalc state:
1. Define action types in `IvAction` union type in `IvState.ts`
2. Handle actions in `ivStateReducer` function in `IvState.ts`
3. State changes trigger localStorage persistence via `saveIvStateCache`

### Component Organization
- Common reusable components in `src/ui/common/`
- Dialog components in `src/ui/Dialog/` (shared) and `src/ui/IvCalc/Box/` (IV-specific)
- Feature-specific components nested under their app folder

### Testing
- Vitest with jsdom environment
- Test files use `.test.ts` suffix, co-located with source files
- Focus on utility/calculation logic rather than UI components

## Important Notes

- The app uses `window.location` for routing (no react-router)
- PWA support with service worker registration in `index.tsx`
- AdSense banner emulation in development mode
- Strict TypeScript configuration with `noImplicitAny` enabled
- Game data is extensive - always reference existing patterns when adding new Pokémon/features
