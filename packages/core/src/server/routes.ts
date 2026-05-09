import express, { type Express } from "express";
import path from "node:path";
import type { Graph, RetangleServerOptions } from "@retangle/types";

export function registerRoutes(
  app: Express,
  getGraph: () => Graph,
  options: RetangleServerOptions,
): void {
  const { uiDistPath, meta } = options;

  app.get("/api/graph", (_req, res) => {
    res.json(getGraph());
  });

  app.get("/api/project", (_req, res) => {
    res.json(meta);
  });

  app.use(express.static(uiDistPath));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(uiDistPath, "index.html"));
  });
}
