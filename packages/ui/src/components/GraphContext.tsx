import { Graph, GraphNode, RetangleProjectMeta } from "@retangle/types";
import { createContext, ReactNode, useEffect, useState } from "react";
import { SimNode } from "./Graph";

type GraphContextType = {
  hiddenComponentNodes: GraphNode[];
  setHiddenComponentNodes: (nodes: GraphNode[]) => void;
  hiddenHookNodes: GraphNode[];
  setHiddenHookNodes: (nodes: GraphNode[]) => void;
  selectedNode: GraphNode | SimNode | null;
  setSelectedNode: (node: GraphNode | SimNode | null) => void;
  graph: Graph | null;
  setGraph: (graph: Graph) => void;
  meta: RetangleProjectMeta | null;
};

export const GraphContext = createContext<GraphContextType>({
  hiddenComponentNodes: [],
  setHiddenComponentNodes: () => {},
  hiddenHookNodes: [],
  setHiddenHookNodes: () => {},
  selectedNode: null,
  setSelectedNode: () => {},
  graph: null,
  setGraph: () => {},
  meta: null,
});

const GraphContextProvider = ({ children }: { children: ReactNode }) => {
  const [hiddenComponentNodes, setHiddenComponentNodes] = useState<GraphNode[]>(
    [],
  );
  const [hiddenHookNodes, setHiddenHookNodes] = useState<GraphNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | SimNode | null>(
    null,
  );
  const [graph, setGraph] = useState<Graph | null>(null);
  const [meta, setMeta] = useState<RetangleProjectMeta | null>(null);

  useEffect(() => {
    const getGraph = async () => {
      const res = await fetch("/api/graph");
      const graph = await res.json();
      setGraph(graph);
    };
    getGraph();
  }, []);

  useEffect(() => {
    const getMeta = async () => {
      const res = await fetch("/api/project");
      const meta = await res.json();
      setMeta(meta);
    };
    getMeta();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`ws://${location.host}`);
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === "graph:update") setGraph(data);
    };
    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, []);

  return (
    <GraphContext.Provider
      value={{
        hiddenComponentNodes,
        setHiddenComponentNodes,
        hiddenHookNodes,
        setHiddenHookNodes,
        selectedNode,
        setSelectedNode,
        graph,
        setGraph,
        meta,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export default GraphContextProvider;
