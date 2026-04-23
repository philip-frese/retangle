import { GraphNode } from "@retangle/types";
import { SimNode } from "./Graph";
import { graphColors } from "../lib/constants";

type NodeDetailViewProps = {
  hide: () => void;
  node: GraphNode | SimNode;
};

const NodeDetailView = ({ hide, node }: NodeDetailViewProps) => {
  return (
    <div className="absolute top-[16px] right-[16px] bg-zinc-900 rounded-lg min-w-[260px] shadow-lg px-4 py-3 border-solid border-1 border-zinc-800">
      <div className="flex justify-between items-center mb-[12px]">
        <span
          className={"text-[12px] uppercase font-semibold text-zinc-50"}
          style={{
            color: graphColors[node.type],
          }}
        >
          {node.type}
        </span>
        <button
          className="bg-none border-none cursor-pointer text-[16px] text-zinc-50"
          onClick={hide}
        >
          ×
        </button>
      </div>
      <div className="mb-[8px] text-[16px] text-white font-semibold">
        {node.name}
      </div>
      <div className="text-[12px] text-zinc-50 break-all mb-[12px]">
        {node.filePath}
      </div>
      {node.builtinHooksCalled.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-zinc-50 mb-[4px]">
            BUILT-IN HOOKS
          </div>
          <div className="flex flex-wrap gap-2">
            {node.builtinHooksCalled.map((name: string) => (
              <span
                key={name}
                className="text-[11px] bg-zinc-800 rounded-md text-white p-1"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeDetailView;
