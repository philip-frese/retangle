import { Graph, GraphNode } from "@retangle/types";
import { useMemo } from "react";

export const useFilteredGraph = (
  graph: Graph,
  hiddenComponentNodes: GraphNode[],
  hiddenHookNodes: GraphNode[],
) => {
  const hiddenComponentNodeIds = useMemo(
    () => hiddenComponentNodes.map(({ id }) => id),
    [hiddenComponentNodes],
  );
  const hiddenHookNodeIds = useMemo(
    () => hiddenHookNodes.map(({ id }) => id),
    [hiddenHookNodes],
  );

  const filteredGraph: Graph = useMemo(() => {
    const filteredEdges = graph.edges.filter(
      (edge) =>
        !hiddenComponentNodeIds.includes(edge.from) &&
        !hiddenComponentNodeIds.includes(edge.to) &&
        !hiddenHookNodeIds.includes(edge.from) &&
        !hiddenHookNodeIds.includes(edge.to),
    );

    const filteredComponentNodes = graph.componentNodes.filter(
      (componentNode) => !hiddenComponentNodeIds.includes(componentNode.id),
    );
    const filteredHookNodes = graph.hookNodes.filter(
      (hookNode) => !hiddenHookNodeIds.includes(hookNode.id),
    );

    return {
      edges: filteredEdges,
      componentNodes: filteredComponentNodes,
      hookNodes: filteredHookNodes,
    };
  }, [graph, hiddenComponentNodeIds, hiddenHookNodeIds]);

  return {
    filteredGraph,
  };
};
