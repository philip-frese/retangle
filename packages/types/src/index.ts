import { SimulationLinkDatum, SimulationNodeDatum } from "d3";

export type HookDependency = {
  name: string;
  type: "builtin" | "custom";
  filePath?: string; // undefined for builtins
};

export type HookDefinition = {
  name: string;
  filePath: string;
  dependencies: HookDependency[];
  builtinDependencies: string[];
};

export type ComponentDefinition = {
  name: string;
  filePath: string;
  consumes: HookDependency[];
  builtinConsumes: string[];
};

export type ParseResult = {
  hooks: HookDefinition[];
  components: ComponentDefinition[];
};

export type GraphNode = {
  id: string;
  name: string;
  filePath: string;
  type: "hook" | "component";
  builtinHooksCalled: string[];
} & SimulationNodeDatum;

export type GraphEdge = {
  id: string;
  from: string;
  to: string;
  data: string[]; // Which data is exposed from a hook to a component
  type: "depends-on" | "consumes";
} & SimulationLinkDatum<GraphNode>;

export type Graph = {
  componentNodes: GraphNode[];
  hookNodes: GraphNode[];
  edges: GraphEdge[];
};
