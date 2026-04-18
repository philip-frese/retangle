import express, { type Express } from "express";
import path from "node:path";
import type { Graph } from "@retangle/types";

export function registerRoutes(
  app: Express,
  getGraph: () => Graph,
  uiDistPath?: string,
): void {
  app.get("/api/graph", (_req, res) => {
    res.json(getGraph());
  });

  if (uiDistPath) {
    app.use(express.static(uiDistPath));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(uiDistPath, "index.html"));
    });
  }
}
