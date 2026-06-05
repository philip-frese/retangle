import { GraphNode } from "@retangle/types";
import { SimNode } from "./Graph";
import { graphColors } from "../lib/constants";

type NodeDetailViewProps = {
  hide: () => void;
  node: GraphNode | SimNode;
};

const ExposedPropertiesView = ({ node }: { node: GraphNode | SimNode }) => (
  <div>
    <div className="text-sm mb-1 font-semibold text-zinc-50">
      EXPORTED PROPERTIES
    </div>
    <div className="flex flex-wrap gap-2">
      {node.exposedProperties.map(({ name, type }) => (
        <span
          key={name}
          className="text-sm bg-zinc-800 rounded-md text-white p-1"
        >
          {name}: <span className="text-indigo-400">{type}</span>
        </span>
      ))}
    </div>
  </div>
);

const BuiltinHooksCalledView = ({ node }: { node: GraphNode | SimNode }) => (
  <div>
    <div className="text-sm mb-1 font-semibold text-zinc-50">
      BUILT-IN HOOKS
    </div>
    <div className="flex flex-wrap gap-2">
      {node.builtinHooksCalled.map((name: string) => (
        <span
          key={name}
          className="text-sm bg-zinc-800 rounded-md text-white p-1"
        >
          {name}
        </span>
      ))}
    </div>
  </div>
);

const NodeDetailView = ({ hide, node }: NodeDetailViewProps) => {
  return (
    <div className="absolute flex flex-col gap-4 top-[16px] right-[16px] max-w-[500px] bg-zinc-900 rounded-lg min-w-[260px] shadow-lg px-4 py-3 border-solid border-1 border-zinc-800">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span
            className={"text-base uppercase font-semibold text-zinc-50"}
            style={{
              color: graphColors[node.type],
            }}
          >
            {node.type}
          </span>
          <button
            className="bg-none border-none cursor-pointer text-lg text-zinc-50"
            onClick={hide}
          >
            ×
          </button>
        </div>
        <div>
          <div className="mb-1 text-base text-zinc-50 break-all">
            {node.filePath}
          </div>
          <div className="text-lg mb-3 text-white font-semibold">
            {node.name}
          </div>
        </div>
      </div>
      {node.exposedProperties.length > 0 && (
        <ExposedPropertiesView node={node} />
      )}
      {node.builtinHooksCalled.length > 0 && (
        <BuiltinHooksCalledView node={node} />
      )}
    </div>
  );
};

export default NodeDetailView;
