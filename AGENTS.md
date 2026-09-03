# Repository Guidelines

## Project Structure & Module Organization

- `src/core/` contains shared types and item-rendering logic.
- `src/hooks/` contains the `useStreaming` stateful hook.
- `src/components/` contains the public React components.
- `src/index.ts` defines the package's public exports.
- `test/` contains Vitest tests, including React Testing Library coverage.
- `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, and `.eslintrc.cjs` hold project tooling configuration.
- `dist/` is generated build output. Do not edit it directly.

## Build, Test, and Development Commands

Run these commands from the repository root:

```bash
npm install            # Install dependencies
npm run typecheck      # Run TypeScript without emitting files
npm test               # Run the Vitest suite
npm run lint           # Check TypeScript and TSX with ESLint
npm run build          # Build ESM, CommonJS, and declaration output
npm run pack:check     # Build and verify the npm package contents
```

This repository is a library, so it does not provide a local application dev server.

## Coding Style & Naming Conventions

Use TypeScript and TSX with two-space indentation, single quotes, semicolons, and the existing ESLint rules. Name React components, interfaces, and types in PascalCase; name hooks with the `use` prefix; use camelCase for functions, variables, and props. Keep public APIs exported through `src/index.ts`, preserve React 16.8 compatibility, and avoid adding dependencies for small utilities.

## Testing Guidelines

Tests use Vitest with a `jsdom` environment and React Testing Library. Name files `*.test.ts` or `*.test.tsx`, and organize cases around observable behavior. Add focused regression coverage for behavior changes, especially streaming order, reset behavior, and stale callbacks. Run `npm test` and `npm run typecheck` before submitting changes. No coverage threshold is configured.

## Commit & Pull Request Guidelines

No Git history is available in this working copy, so an existing commit convention cannot be verified. Use short, imperative commit subjects such as `Fix streaming reset behavior`. Keep pull requests focused, describe the behavior change and validation commands, and link an issue when one exists. Run `npm run pack:check` for package-facing changes and mention any generated `dist/` updates explicitly.
