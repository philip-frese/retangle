import { SimulationLinkDatum, SimulationNodeDatum } from "d3";

export type HookProperty = {
  name: string;
  type: string;
};

export const BUILTIN_HOOKS = [
  "useState",
  "useEffect",
  "useRef",
  "useMemo",
  "useCallback",
  "useContext",
  "useReducer",
  "useLayoutEffect",
  "useId",
  "useTransition",
  "useDeferredValue",
  "useImperativeHandle",
] as const;

export type BuiltinHookDependency = (typeof BUILTIN_HOOKS)[number];

export type CustomHookDependency = {
  name: string;
  consumedProperties: HookProperty[];
  filePath: string;
};

export type HookDefinition = {
  name: string;
  filePath: string;
  dependencies: CustomHookDependency[];
  builtinDependencies: BuiltinHookDependency[];
  exposedProperties: HookProperty[];
};

export type ComponentDefinition = {
  name: string;
  filePath: string;
  consumes: CustomHookDependency[];
  builtinConsumes: BuiltinHookDependency[];
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

export type RetangleProjectMeta = {
  name: string | undefined;
};

export type RetangleServerOptions = {
  uiDistPath: string;
  meta: RetangleProjectMeta;
};
