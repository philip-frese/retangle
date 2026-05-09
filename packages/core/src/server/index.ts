import express from "express";
import { createServer } from "node:http";
import type { Graph, RetangleServerOptions } from "@retangle/types";
import { registerRoutes } from "./routes.js";
import { createWsServer } from "./ws.js";
import { createWatcher } from "./watcher.js";

export interface RetangleServer {
  start: () => void;
  update: (graph: Graph) => void;
  watch: (watchPath: string, onUpdate: () => void) => void;
}

export function createRetangleServer(
  port: number = 7777,
  options: RetangleServerOptions,
): RetangleServer {
  const app = express();
  const httpServer = createServer(app);
  const { broadcast } = createWsServer(httpServer);
  let currentGraph: Graph = { componentNodes: [], hookNodes: [], edges: [] };

  registerRoutes(app, () => currentGraph, options);

  return {
    start: () => {
      httpServer.listen(port, () => {
        console.log(`Retangle server running on http://localhost:${port}`);
      });
    },
    update: (graph: Graph) => {
      currentGraph = graph;
      broadcast(graph);
    },
    watch: (watchPath, onUpdate) => {
      createWatcher(watchPath, onUpdate);
    },
  };
}
