import { useContext } from "react";
import Graph from "./Graph";
import Sidebar from "./Sidebar";
import { GraphContext } from "./GraphContext";
import NodeDetailView from "./NodeDetailView";

const App = () => {
  const {
    graph,
    hiddenComponentNodes,
    setHiddenComponentNodes,
    hiddenHookNodes,
    setHiddenHookNodes,
    selectedNode,
    setSelectedNode,
  } = useContext(GraphContext);

  if (!graph) return null;

  return (
    <div className="w-screen h-screen flex">
      <div className="w-full min-w-[300px] max-w-[400px] h-full">
        <Sidebar
          graph={graph}
          hiddenComponentNodes={hiddenComponentNodes}
          setHiddenComponentNodes={setHiddenComponentNodes}
          hiddenHookNodes={hiddenHookNodes}
          setHiddenHookNodes={setHiddenHookNodes}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        />
      </div>
      <div className="w-full m-0 bg-zinc-800">
        <Graph
          graph={graph}
          hiddenComponentNodes={hiddenComponentNodes}
          hiddenHookNodes={hiddenHookNodes}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        />
      </div>
      {selectedNode !== null && (
        <NodeDetailView
          hide={() => setSelectedNode(null)}
          node={selectedNode}
        />
      )}
    </div>
  );
};

export default App;
