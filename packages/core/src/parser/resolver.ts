import { Node, Project, SyntaxKind } from "ts-morph";
import type { HookDefinition } from "@retangle/types";

/**
 * Resolves the `filePath` of each custom hook dependency using the TypeScript
 * language service, rather than naive name matching.
 *
 * For each custom dependency, finds the corresponding call expression in the
 * hook's source file, then uses `getSymbol()` + `getImplementations()` to
 * follow re-exports and barrel files to the actual implementation site.
 *
 * Built-in hooks are passed through unchanged.
 *
 * @param hooks - Hook definitions with unresolved custom dependency paths.
 * @param project - The ts-morph `Project` providing language service access.
 * @returns The same hooks with `filePath` populated on custom dependencies.
 */
export function resolveCustomHooks(
  hooks: HookDefinition[],
  project: Project,
): HookDefinition[] {
  return hooks.map((hook) => ({
    ...hook,
    dependencies: hook.dependencies.map((dep) => {
      if (dep.type !== "custom") return dep;

      const sourceFile = project.getSourceFile(hook.filePath);
      if (!sourceFile) return dep;

      const callExpr = sourceFile
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .find((c) => c.getExpression().getText() === dep.name);

      if (!callExpr) return dep;

      const definitions = callExpr
        .getExpression()
        .getSymbol()
        ?.getDeclarations();

      const rootDefinition = definitions?.[0];

      if (!rootDefinition) return dep;

      const expr = callExpr.getExpression();

      const filePath = Node.isIdentifier(expr)
        ? (expr.getImplementations()?.[0]?.getSourceFile().getFilePath() ??
          rootDefinition.getSourceFile().getFilePath())
        : rootDefinition.getSourceFile().getFilePath();

      return { ...dep, filePath };
    }),
  }));
}
