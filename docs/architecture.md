# Architecture

## Application Structure

The app uses a **dual-app architecture** with client-side routing:
- `src/ui/App.tsx` - Root component that switches between ResearchCalc and IvCalc based on URL path
- `src/index.tsx` - Entry point handling i18n initialization, error handlers, and PWA setup
- URL-based routing: `/pokesleep-tool/` → Research Calc, `/pokesleep-tool/iv/` → IV Calc

## Two Main Applications

**1. IV Calc (`src/ui/IvCalc/`)**
- Complex state management using `useReducer` with `IvState` and `IvAction` types defined in `IvState.ts`
- Dual-tab interface: Upper tabs (RP/Strength/Rating) and Lower tabs (Form/Box/Settings)
- Box system for storing multiple Pokémon with localStorage persistence
- State includes: pokemonIv, box, parameter (strength settings), dialog states, tab indices
- Main component: `IvCalcApp.tsx` orchestrates all sub-components and state

**2. Research Calc (`src/ui/ResearchCalc/`)**
- Simpler state management with useState
- Configuration persisted via `ResearchCalcAppConfig.ts`
- Main component: `ResearchCalcApp.tsx`

## Core Utilities (`src/util/`)

Business logic is separated from UI in utility classes:
- `PokemonIv.ts` - Individual value calculations and Pokémon data management
- `PokemonStrength.ts` - Strength/power calculations (large file, complex logic)
- `PokemonRp.ts` - RP calculations (RP is a term used in Pokémon Sleep)
- `PokemonBox.ts` - Box storage management with localStorage
- `Energy.ts` - Energy-related calculations

## Data Layer (`src/data/`)

Static game data loaded from JSON:
- `pokemon.json` - All Pokémon data (largest file)
- `news.json` - App news/announcements
- TypeScript files (ex: `pokemons.ts`) provide typed access to JSON data

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
