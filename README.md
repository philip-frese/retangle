# retangle

> Untangle your React hook dependencies.

**retangle** statically analyzes your React + TypeScript codebase and generates an interactive visual map of how hooks expose data and which components or hooks consume it.

## Features

- 🔍 **Static analysis** — no runtime instrumentation, works on any React + TypeScript codebase
- 🧶 **Hook dependency graph** — see which hooks call which, and what data flows where
- ⚡ **React Query aware** — `useQuery` and `useMutation` hooks are highlighted with their query keys
- 🔄 **Watch mode** — re-analyzes on file save
- 📦 **Zero config** — points at a directory, works

## Usage

```bash
# One-off analysis (opens browser automatically)
npx retangle ./my-react-app

# Watch mode
npx retangle ./my-react-app --watch

# Custom port
npx retangle ./my-react-app --port 3333
```

## Node types

| Color  | Type       | Description                          |
|--------|------------|--------------------------------------|
| 🔵 Blue  | Component  | React component                      |
| 🟣 Violet | Custom Hook | User-defined `useXxx` hook          |
| 🟠 Orange | Query Hook | `useQuery`, `useInfiniteQuery`       |
| 🩷 Pink  | Mutation   | `useMutation`                        |
| ⚫ Gray  | Built-in   | `useState`, `useEffect`, etc.        |

## How it works

retangle uses the **TypeScript Compiler API** (via [ts-morph](https://ts-morph.com)) to walk your source files and build a dependency graph:

1. **Parser** — finds all function declarations and arrow functions, detects hook calls via AST traversal
2. **Graph builder** — maps caller → callee relationships and tracks which return bindings are consumed
3. **Server** — bundles the UI and serves it locally with the graph as a JSON API endpoint
4. **UI** — React Flow canvas with a detail sidebar

## Development

```bash
git clone https://github.com/yourusername/retangle
cd retangle
npm install
npm run build
```

For UI development with hot reload:
```bash
# Terminal 1: run the CLI against a test project
node packages/cli/dist/cli.js ./test-fixture --no-open

# Terminal 2: start Vite dev server (proxies /api to the CLI)
npm run dev -w packages/ui
```

## Roadmap

- [ ] Cross-file hook resolution (currently tracks within-file only)
- [ ] Filter panel (show only hooks consumed by a specific component)
- [ ] Export to SVG / PNG
- [ ] Support for `.js`/`.jsx` projects via Babel fallback
- [ ] VS Code extension
