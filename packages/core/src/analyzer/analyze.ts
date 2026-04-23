import {
  ComponentDefinition,
  GraphEdge,
  GraphNode,
  HookDefinition,
  HookDependency,
  ParseResult,
} from "@retangle/types";
import { v4 } from "uuid";

export function analyzeHooks(parseResult: ParseResult): {
  hookNodes: GraphNode[];
  componentNodes: GraphNode[];
  graphEdges: GraphEdge[];
} {
  const componentNodes: GraphNode[] = parseResult.components.map(
    (component) => ({
      id: v4(),
      name: component.name,
      filePath: component.filePath,
      type: "component",
      builtinHooksCalled: component.builtinConsumes,
    }),
  );

  const hookNodes: GraphNode[] = parseResult.hooks.map((hook) => ({
    id: v4(),
    name: hook.name,
    filePath: hook.filePath,
    type: "hook",
    builtinHooksCalled: hook.builtinDependencies,
  }));

  return {
    hookNodes,
    componentNodes,
    graphEdges: getGraphEdges([...componentNodes, ...hookNodes], parseResult),
  };
}

function getGraphNodes(
  hookDependencies: HookDependency[],
  graphNodes: GraphNode[],
) {
  const nodes: GraphNode[] = hookDependencies
    .map(({ type, name, filePath }: HookDependency) => {
      if (type === "builtin") return;
      return graphNodes.find(
        (node) =>
          node.type === "hook" &&
          node.filePath === filePath &&
          node.name === name,
      );
    })
    .filter((node) => !!node);

  return Array.from(
    new Map<string, GraphNode>(nodes.map((node) => [node.id, node])).values(),
  );
}

function getGraphEdges(
  graphNodes: GraphNode[],
  parseResult: ParseResult,
): GraphEdge[] {
  return [...parseResult.components, ...parseResult.hooks]
    .flatMap((parseResult) => {
      const isComponent =
        typeof parseResult === "object" && "consumes" in parseResult;
      const originalNode = graphNodes.find(
        (node) =>
          ((node.type === "component" && isComponent) ||
            (node.type === "hook" && !isComponent)) &&
          node.filePath === parseResult.filePath &&
          node.name === parseResult.name,
      );

      if (!originalNode) return;

      const hookNodes = getGraphNodes(
        isComponent
          ? (parseResult as ComponentDefinition).consumes
          : (parseResult as HookDefinition).dependencies,
        graphNodes,
      );

      return Array.from(hookNodes.values()).map(
        (node) =>
          ({
            id: v4(),
            from: originalNode.id,
            to: node.id,
            source: node.id,
            target: originalNode.id,
            type: isComponent ? "consumes" : "depends-on",
            data: [],
          }) as GraphEdge,
      );
    })
    .filter((edge) => !!edge);
}
