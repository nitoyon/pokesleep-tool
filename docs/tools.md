# Tools

The application is built with Vite, TypeScript, React 19, and Material-UI v7, using Biome for formatting and oxlint for linting, supporting internationalization via react-i18next.

- **Vite** - Build tool
- **Biome** (`@biomejs/biome`) - Code formatter; run via `npm run fmt`
- **oxlint** - Fast Rust-based linter; run via `npm run lint`
- **Lefthook** - Git pre-commit hooks that auto-format staged files and run tests

## Build Configuration

Vite builds 10 HTML entry points (2 apps × 5 languages) with code splitting:
- `mui`, `react`, `vendor` chunk - node_modules
- `pokemon`, `field`, `event`, `news` chunks - Game data
- `i18n` chunk - Internationalization files
- `pokemon-icon`, `svg-icon` chunks - Icon resources
- `data`, `util`, `ui` chunks - Application code

## Pre-commit hook
- Run `oxlint --fix`, `biome check --write` and `vitest`
- Configured in `lefthook.yml`

## Post edit hook (Claude code)
- Run `biome fmt` and `oxlint --fix`
- Written in `.claude/hooks/post-ts-lint.sh`

## CI
- Run `npm run verify`
- Written in `.github/ci.yml`
