import { GraphEdge, GraphNode, ParseResult } from "@retangle/types";
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
      exposedProperties: [],
    }),
  );

  const hookNodes: GraphNode[] = parseResult.hooks.map((hook) => ({
    id: v4(),
    name: hook.name,
    filePath: hook.filePath,
    type: "hook",
    builtinHooksCalled: hook.builtinDependencies,
    exposedProperties: hook.exposedProperties,
  }));

  return {
    hookNodes,
    componentNodes,
    graphEdges: getGraphEdges([...componentNodes, ...hookNodes], parseResult),
  };
}

function getGraphEdges(
  graphNodes: GraphNode[],
  parseResult: ParseResult,
): GraphEdge[] {
  const edges: GraphEdge[] = [];

  for (const component of parseResult.components) {
    const originalNode = graphNodes.find(
      (n) =>
        n.type === "component" &&
        n.filePath === component.filePath &&
        n.name === component.name,
    );
    if (!originalNode) continue;

    for (const dep of component.consumes) {
      const hookNode = graphNodes.find(
        (n) =>
          n.type === "hook" &&
          n.filePath === dep.filePath &&
          n.name === dep.name,
      );
      if (!hookNode) continue;
      edges.push({
        id: v4(),
        from: hookNode.id,
        to: originalNode.id,
        source: hookNode.id,
        target: originalNode.id,
        type: "consumes",
        data: dep.consumedProperties,
      });
    }
  }

  for (const hook of parseResult.hooks) {
    const originalNode = graphNodes.find(
      (n) =>
        n.type === "hook" &&
        n.filePath === hook.filePath &&
        n.name === hook.name,
    );
    if (!originalNode) continue;

    for (const dep of hook.dependencies) {
      const hookNode = graphNodes.find(
        (n) =>
          n.type === "hook" &&
          n.filePath === dep.filePath &&
          n.name === dep.name,
      );
      if (!hookNode) continue;
      edges.push({
        id: v4(),
        from: hookNode.id,
        to: originalNode.id,
        source: hookNode.id,
        target: originalNode.id,
        type: "depends-on",
        data: dep.consumedProperties,
      });
    }
  }

  return edges;
}
