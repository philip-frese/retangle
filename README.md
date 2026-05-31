# retangle

> Untangle your React hook dependencies.

**retangle** statically analyzes your React + TypeScript codebase and generates an interactive visual map of how hooks expose data and which components or hooks consume it.

## Features

- 🔍 **Static analysis** — no runtime instrumentation, works on any React + TypeScript codebase
- 🧶 **Hook dependency graph** — see which hooks call which, and what data flows between them
- 🏷️ **Property-level tracking** — edges show exactly which properties are consumed from each hook
- 🔄 **Watch mode** — re-analyzes on file save and pushes updates to the UI via WebSocket
- 📦 **Zero config** — point at a directory and it works; optional `retangle.config.ts` for fine-grained control
- 🎛️ **Interactive UI** — drag nodes freely, hide/show individual hooks and components, click any node for details

## Usage

```bash
# Run against a project
node packages/core/dist/cli/index.js --project ./my-react-app

# With explicit tsconfig and glob filters
node packages/core/dist/cli/index.js \
  --project ./my-react-app \
  --tsconfig ./my-react-app/tsconfig.json \
  --include "**/*.ts" "**/*.tsx" \
  --exclude "**/*.test.ts"

# Custom port (default: 7777)
node packages/core/dist/cli/index.js --project ./my-react-app --port 3333
```

Then open `http://localhost:7777` in your browser.

## Config file

Create a `retangle.config.ts` in your project root to avoid passing flags every time:

```ts
import { defineConfig } from "retangle";

export default defineConfig({
  projectPath: "./",
  tsConfigFilePath: "tsconfig.json",
  include: ["src/**/*.ts", "src/**/*.tsx"],
  exclude: ["**/*.test.ts", "**/*.spec.tsx"],
});
```

## How it works

retangle uses the **TypeScript Compiler API** (via [ts-morph](https://ts-morph.com)) to walk your source files and build a dependency graph:

1. **Extractor** — finds all hooks and components via AST traversal, extracts consumed properties (destructured from hook calls) and exposed properties (returned from hooks)
2. **Resolver** — uses the TypeScript language service to resolve each custom hook dependency to its actual definition file, correctly handling re-exports and barrel files
3. **Analyzer** — builds graph nodes and edges; edge `data` carries the consumed properties between two nodes
4. **Server** — serves the UI statically and exposes the graph via `GET /api/graph`; pushes live updates via WebSocket on file change
5. **UI** — D3 force-directed graph with a sidebar for filtering and a detail card per node

## Node types

| Type | Description |
|---|---|
| Component | React component (uppercase function that calls at least one hook) |
| Hook | User-defined `useXxx` hook |

Built-in hooks (`useState`, `useEffect`, etc.) are not rendered as graph nodes — they are stored as metadata on each node and visible in the detail view.

## Development

```bash
git clone https://github.com/yourusername/retangle
cd retangle
npm install
npm run build
```

For UI development with hot reload:

```bash
# Terminal 1: run the CLI against the test fixture
node packages/core/dist/cli/index.js --project ./test --tsconfig ./test/tsconfig.json --include "**/*.ts" "**/*.tsx"

# Terminal 2: start Vite dev server (proxies /api and /ws to the CLI server)
npm run dev:ui
```

Then open `http://localhost:5173`.

## Roadmap

- [ ] npm publish (`retangle` CLI installable via `npx`)
- [ ] Export graph to SVG / PNG
- [ ] Support for `.js` / `.jsx` projects
- [ ] VS Code extension
