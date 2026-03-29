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
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
} {
  const graphNodes: GraphNode[] = [
    ...(parseResult.components.map((component) => ({
      id: v4(),
      name: component.name,
      filePath: component.filePath,
      type: "component",
    })) as GraphNode[]),
    ...(parseResult.hooks.map((hook) => ({
      id: v4(),
      name: hook.name,
      filePath: hook.filePath,
      type: "hook",
    })) as GraphNode[]),
  ];

  return { graphNodes, graphEdges: getGraphEdges(graphNodes, parseResult) };
}

function getGraphNodes(
  hookDependencies: HookDependency[],
  graphNodes: GraphNode[],
) {
  const nodes: GraphNode[] = hookDependencies
    .map(({ type, name, filePath }: HookDependency) => {
      return type === "builtin"
        ? ({
            id: name,
            name: name,
            filePath: "builtin",
            type: "hook",
          } as GraphNode)
        : graphNodes.find(
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

      const hooks = getGraphNodes(
        isComponent
          ? (parseResult as ComponentDefinition).consumes
          : (parseResult as HookDefinition).dependencies,
        graphNodes,
      );

      return Array.from(hooks.values()).map(
        (hook) =>
          ({
            from: hook.id,
            to: originalNode.id,
            type: isComponent ? "consumes" : "depends-on",
            data: [],
          }) as GraphEdge,
      );
    })
    .filter((edge) => !!edge);
}
