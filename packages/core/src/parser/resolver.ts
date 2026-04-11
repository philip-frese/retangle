import { Node, Project, SyntaxKind } from "ts-morph";
import type { HookDependency, ParseResult } from "@retangle/types";

function resolveHooks(
  sourceFilePath: string,
  hookDependecies: HookDependency[],
  project: Project,
) {
  return hookDependecies.map((dep) => {
    if (dep.type !== "custom") return dep;

    const sourceFile = project.getSourceFile(sourceFilePath);
    if (!sourceFile) return dep;

    const callExpr = sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .find((c) => c.getExpression().getText() === dep.name);

    if (!callExpr) return dep;

    const definitions = callExpr.getExpression().getSymbol()?.getDeclarations();
    const rootDefinition = definitions?.[0];
    if (!rootDefinition) return dep;

    const expr = callExpr.getExpression();
    const filePath = Node.isIdentifier(expr)
      ? (expr.getImplementations()?.[0]?.getSourceFile().getFilePath() ??
        rootDefinition.getSourceFile().getFilePath())
      : rootDefinition.getSourceFile().getFilePath();

    return { ...dep, filePath };
  });
}

export function resolveParseResult(
  result: ParseResult,
  project: Project,
): ParseResult {
  return {
    hooks: result.hooks.map((hook) => ({
      ...hook,
      dependencies: resolveHooks(hook.filePath, hook.dependencies, project),
    })),
    components: result.components.map((component) => ({
      ...component,
      consumes: resolveHooks(component.filePath, component.consumes, project),
    })),
  };
}
