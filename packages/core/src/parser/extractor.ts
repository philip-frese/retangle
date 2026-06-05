import {
  BindingElement,
  CallExpression,
  Node,
  ObjectLiteralExpression,
  ReturnStatement,
  SourceFile,
  SyntaxKind,
  VariableDeclaration,
} from "ts-morph";
import {
  type HookDefinition,
  type ComponentDefinition,
  type CustomHookDependency,
  type BuiltinHookDependency,
  type HookProperty,
  BUILTIN_HOOKS,
} from "@retangle/types";

const BUILTIN_SET = new Set<string>(BUILTIN_HOOKS);

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

    const [builtinHooks, customHooks] = getCalledHooks(fn, filePath);
    const uniqueBuiltinHooks = Array.from(new Set(builtinHooks).values());

    if (name.startsWith("use")) {
      hooks.push({
        name,
        filePath,
        dependencies: customHooks,
        builtinDependencies: uniqueBuiltinHooks,
        exposedProperties: getExposedProperties(fn),
      });
    } else if (
      /^[A-Z]/.test(name) &&
      uniqueBuiltinHooks.length + customHooks.length > 0
    ) {
      components.push({
        name,
        filePath,
        consumes: customHooks,
        builtinConsumes: uniqueBuiltinHooks,
      });
    }
  }

  return { hooks, components };
}

/**
 * Returns all hook calls found within a function node, classified as
 * `builtin` (React built-ins) or `custom` (user-defined).
 */
function getCalledHooks(
  fn: any,
  filePath: string,
): [BuiltinHookDependency[], CustomHookDependency[]] {
  const hooks: CallExpression[] = fn
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((expr: CallExpression) => {
      const name = expr.getExpression().getText();
      return name.startsWith("use") && /^use[A-Z]/.test(name);
    });

  const builtins: BuiltinHookDependency[] = [];
  const customs: CustomHookDependency[] = [];

  hooks.forEach((hook) => {
    if (BUILTIN_SET.has(hook.getExpression().getText())) {
      builtins.push(hook.getExpression().getText() as BuiltinHookDependency);
    } else {
      const consumedProperties = getConsumedProperties(hook);
      customs.push({
        name: hook.getExpression().getText(),
        consumedProperties,
        filePath,
      });
    }
  });

  return [builtins, customs];
}

function getConsumedProperties(call: CallExpression): HookProperty[] {
  const parent = call.getParent();
  if (!parent || parent.getKind() !== SyntaxKind.VariableDeclaration) return [];
  const nameNode = (parent as VariableDeclaration).getNameNode();
  if (!Node.isObjectBindingPattern(nameNode)) return [];

  return nameNode.getElements().map((element: BindingElement) => {
    const name =
      element.getPropertyNameNode()?.getText() ??
      element.getNameNode().getText();
    const type = element.getType().getText(element);
    return { name, type };
  });
}

function getExposedProperties(fn: any): HookProperty[] {
  const returnStatements: ReturnStatement[] = fn.getDescendantsOfKind(
    SyntaxKind.ReturnStatement,
  );
  for (const ret of returnStatements) {
    const expr: ObjectLiteralExpression | undefined = ret
      .getExpression()
      ?.asKind(SyntaxKind.ObjectLiteralExpression);

    if (!expr) continue;

    return expr.getProperties().flatMap((prop) => {
      if (Node.isShorthandPropertyAssignment(prop))
        return [{ name: prop.getName(), type: prop.getType().getText(prop) }];
      if (Node.isPropertyAssignment(prop))
        return [{ name: prop.getName(), type: prop.getType().getText(prop) }];
      return [];
    });
  }
  return [];
}
