import { Graph, GraphNode, RetangleProjectMeta } from "@retangle/types";
import Collapsable from "./Collapsable";
import { memo, useCallback } from "react";

type SidebarProps = {
  graph: Graph;
  hiddenHookNodes: GraphNode[];
  setHiddenHookNodes: (nodes: GraphNode[]) => void;
  hiddenComponentNodes: GraphNode[];
  setHiddenComponentNodes: (nodes: GraphNode[]) => void;
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  projectMeta: RetangleProjectMeta | null;
};

type NodeItemProps = {
  node: GraphNode;
  isHidden: boolean;
  setIsHidden: (node: GraphNode) => void;
  onToggleSelected: (node: GraphNode) => void;
};

const EyeButton = memo(
  ({
    isHidden,
    name,
    onClick,
  }: {
    isHidden: boolean;
    name: string;
    onClick: () => void;
  }) => {
    return (
      <button
        type="button"
        aria-label={`Hide or show ${name}`}
        onClick={onClick}
        className="cursor-pointer"
      >
        {isHidden ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6 text-zinc-600 hover:text-zinc-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6 text-zinc-50 hover:text-zinc-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        )}
      </button>
    );
  },
);

const NodeItem = memo(
  ({ node, isHidden, setIsHidden, onToggleSelected }: NodeItemProps) => {
    const handleToggleSelected = useCallback(
      () => onToggleSelected(node),
      [onToggleSelected, node],
    );
    const handleToggleHidden = useCallback(
      () => setIsHidden(node),
      [setIsHidden, node],
    );
    return (
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label={`Open detail view for ${node.name}`}
          onClick={handleToggleSelected}
          className="cursor-pointer hover:text-zinc-400"
        >
          {node.name}
        </button>
        <EyeButton
          name={node.name}
          isHidden={isHidden}
          onClick={handleToggleHidden}
        />
      </div>
    );
  },
);

const Sidebar = ({
  graph,
  hiddenComponentNodes,
  setHiddenComponentNodes,
  hiddenHookNodes,
  setHiddenHookNodes,
  selectedNode,
  setSelectedNode,
  projectMeta,
}: SidebarProps) => {
  const toggleComponent = useCallback(
    (node: GraphNode) => {
      if (hiddenComponentNodes.some(({ id }) => id === node.id)) {
        setHiddenComponentNodes(
          hiddenComponentNodes.filter(({ id }) => id !== node.id),
        );
      } else {
        setHiddenComponentNodes([...hiddenComponentNodes, node]);
      }
    },
    [hiddenComponentNodes, setHiddenComponentNodes],
  );

  const toggleHook = useCallback(
    (node: GraphNode) => {
      if (hiddenHookNodes.some(({ id }) => id === node.id)) {
        setHiddenHookNodes(hiddenHookNodes.filter(({ id }) => id !== node.id));
      } else {
        setHiddenHookNodes([...hiddenHookNodes, node]);
      }
    },
    [hiddenHookNodes, setHiddenHookNodes],
  );

  const toggleSelectedNode = useCallback(
    (node: GraphNode) =>
      setSelectedNode(selectedNode?.id === node.id ? null : node),
    [selectedNode, setSelectedNode],
  );

  const toggleAllComponents = useCallback(() => {
    if (hiddenComponentNodes.length > 0) {
      setHiddenComponentNodes([]);
    } else {
      setHiddenComponentNodes(graph.componentNodes);
    }
  }, [hiddenComponentNodes, setHiddenComponentNodes, graph.componentNodes]);

  const toggleAllHooks = useCallback(() => {
    if (hiddenHookNodes.length > 0) {
      setHiddenHookNodes([]);
    } else {
      setHiddenHookNodes(graph.hookNodes);
    }
  }, [hiddenHookNodes, setHiddenHookNodes, graph.hookNodes]);

  return (
    <div className="bg-zinc-900 border-r border-solid border-zinc-900 h-full text-zinc-50 py-4 px-2 flex flex-col gap-4">
      <div className="flex flex-col gap-3 text-center mb-10">
        <div className="w-full h-12 bg-linear-to-bl from-violet-500 to-fuchsia-500 rounded-full flex items-center text-white p-2">
          Retangle
        </div>
        {projectMeta && <span>Project: {projectMeta.name}</span>}
      </div>
      <Collapsable
        title={
          <div className="flex w-full justify-between items-center">
            Components
            <EyeButton
              name="all"
              isHidden={hiddenComponentNodes.length > 0}
              onClick={toggleAllComponents}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          {graph.componentNodes.map((component) => (
            <NodeItem
              key={component.id}
              node={component}
              onToggleSelected={toggleSelectedNode}
              isHidden={hiddenComponentNodes.some(
                ({ id }) => id === component.id,
              )}
              setIsHidden={toggleComponent}
            />
          ))}
        </div>
      </Collapsable>
      <Collapsable
        title={
          <div className="flex w-full justify-between items-center">
            Hooks
            <EyeButton
              name="all"
              isHidden={hiddenHookNodes.length > 0}
              onClick={toggleAllHooks}
            />
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          {graph.hookNodes.map((hook) => (
            <NodeItem
              key={hook.id}
              node={hook}
              onToggleSelected={toggleSelectedNode}
              isHidden={hiddenHookNodes.some(({ id }) => id === hook.id)}
              setIsHidden={toggleHook}
            />
          ))}
        </div>
      </Collapsable>
    </div>
  );
};

export default Sidebar;
