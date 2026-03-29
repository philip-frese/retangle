import type { RetangleConfig } from "../config/schema.js";
import { buildProject } from "../parser/project.js";
import { extractFromFile } from "../parser/extractor.js";
import { resolveCustomHooks } from "../parser/resolver.js";
import { analyzeHooks } from "../analyzer/analyze.js";
import type { Graph, ParseResult } from "@retangle/types";

export async function runAnalysis(config: RetangleConfig): Promise<Graph> {
  const project = await buildProject(config);

  const parseResult: ParseResult = { hooks: [], components: [] };

  for (const file of project.getSourceFiles()) {
    const { hooks, components } = extractFromFile(file);
    parseResult.hooks.push(...hooks);
    parseResult.components.push(...components);
  }

  parseResult.hooks = resolveCustomHooks(parseResult.hooks, project);

  const { graphNodes, graphEdges } = analyzeHooks(parseResult);

  return { nodes: graphNodes, edges: graphEdges };
}