import { SourceFile, SyntaxKind } from "ts-morph";
import type {
  HookDefinition,
  ComponentDefinition,
  HookDependency,
} from "@retangle/types";

/** React built-in hooks that are resolved without a file path. */
const BUILTIN_HOOKS = new Set([
  "useState",
  "useEffect",
  "useRef",
  "useMemo",
  "useCallback",
  "useContext",
  "useReducer",
  "useLayoutEffect",
  "useId",
  "useTransition",
  "useDeferredValue",
  "useImperativeHandle",
]);

/**
 * Extracts hook definitions and component definitions from a single source file.
 *
 * Detection conventions:
 * - **Hooks**: functions whose name starts with `use` (e.g. `useAuth`)
 * - **Components**: functions whose name starts with an uppercase letter and
 *   that call at least one hook internally
 *
 * Covers both `function` declarations and arrow function variable declarations.
 *
 * @param file - The ts-morph `SourceFile` to analyse.
 * @returns Lists of hooks and components found in the file.
 */
export function extractFromFile(file: SourceFile): {
  hooks: HookDefinition[];
  components: ComponentDefinition[];
} {
  const hooks: HookDefinition[] = [];
  const components: ComponentDefinition[] = [];
  const filePath = file.getFilePath();

  const functions = [
    ...file.getFunctions(),
    ...file
      .getVariableDeclarations()
      .filter((v) => v.getInitializerIfKind(SyntaxKind.ArrowFunction)),
  ];

  for (const fn of functions) {
    const name = fn.getName();
    if (!name) continue;

    const calledHooks = getCalledHooks(fn);

    if (name.startsWith("use")) {
      hooks.push({ name, filePath, dependencies: calledHooks });
    } else if (/^[A-Z]/.test(name) && calledHooks.length > 0) {
      components.push({
        name,
        filePath,
        consumes: calledHooks.map((h) => h.name),
      });
    }
  }

  return { hooks, components };
}

/**
 * Returns all hook calls found within a function node, classified as
 * `builtin` (React built-ins) or `custom` (user-defined).
 */
function getCalledHooks(fn: any): HookDependency[] {
  return fn
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .map((call: any) => call.getExpression().getText())
    .filter((name: string) => name.startsWith("use") && /^use[A-Z]/.test(name))
    .map((name: string) => ({
      name,
      type: BUILTIN_HOOKS.has(name)
        ? ("builtin" as const)
        : ("custom" as const),
    }));
}
