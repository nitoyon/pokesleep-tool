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

## Fork-specific: Readonly Mode

### Readonly Mode Feature

Readonly Mode enables embedding Pokémon box data directly into the application build for view-only sharing purposes.

**Purpose**: Create distributable versions of the app with pre-configured Pokémon box data that users can view and analyze but not modify. Useful for sharing team recommendations, analysis results, or educational examples.

**Environment Variable**: `VITE_READONLY_MODE=true` activates readonly mode during the build process.

**Build Configuration**: 
- Vite injects the environment variable via `vite.config.ts` line 10
- Environment variable is available as `import.meta.env.VITE_READONLY_MODE` in the application code

**Implementation Details**:
- **`src/util/PokemonBox.ts`**: Core readonly logic
  - `isReadonlyMode()` method checks `import.meta.env.VITE_READONLY_MODE` 
  - Blocks all write operations when in readonly mode: `add()`, `remove()`, `set()`, `save()`
  - `loadEmbeddedData()` fetches data from `embedded-box.txt` instead of localStorage
  - Readonly mode detected at runtime based on build-time environment variable

**UI Changes in Readonly Mode**:
- **`BoxView.tsx`**: Hides the Add FAB (Floating Action Button) when `box.isReadonlyMode()` returns true
- **`StrengthParameterForm.tsx`**: Displays an informational alert explaining readonly mode, hides the initialize button
- **`IvCalcApp.tsx`**: Hides the import dialog functionality to prevent data modification
- **`BoxLargeItem.tsx`**: Passes readonly state to child components, disabling edit controls

**Data File**: 
- `embedded-box.txt` in project root contains the exported Pokémon box data in JSON format
- This file is loaded via fetch request when the app starts in readonly mode
- The file should be created by exporting data from the IV Calculator's Box tab

### GitHub Actions Deployment

The `.github/workflows/deploy.yml` workflow automates readonly mode deployment to GitHub Pages.

**Workflow Steps**:
1. Checkout repository code
2. Setup Node.js 22 with npm caching
3. Install dependencies with `npm ci`
4. **Create embedded box data**: Writes the `EMBEDDED_BOX_DATA` variable to `embedded-box.txt`
5. Run tests in normal mode with `npm test`
6. Build in readonly mode with `VITE_READONLY_MODE=true npm run build`
7. Deploy `dist` folder to GitHub Pages

**Manual Workflow Execution**:
- The workflow includes `workflow_dispatch` trigger for manual execution
- Can be triggered from GitHub Actions tab → Deploy workflow → Run workflow button
- Useful for re-deploying after updating secrets or testing the deployment process
- Executes the same build and deployment steps as automatic triggers

**GitHub Variables Configuration**:
- `EMBEDDED_BOX_DATA` variable stores the Pokémon box JSON data to embed
- Variables are non-masked, making them suitable for non-sensitive data like Pokémon box configurations
- If the variable is not configured, an empty `embedded-box.txt` is created (no build error)
- Variable is accessed via `${{ vars.EMBEDDED_BOX_DATA }}` in the workflow

**Repository Owner Check**:
- The repository_owner check has been removed from the workflow
- Forked repositories can now deploy automatically without any configuration changes
- Any fork can trigger deployments when pushing to main or merging PRs

**Environment Variables in Workflow**:
- `VITE_READONLY_MODE=true` is set at build time to activate readonly mode
- Tests run in normal mode (before readonly build) to validate core functionality
- The build-time environment variable becomes available in the application code at runtime

