import type { Express } from "express";
import type { Graph } from "@retangle/types";

export function registerRoutes(app: Express, getGraph: () => Graph): void {
  app.get("/api/graph", (_req, res) => {
    res.json(getGraph());
  });
}
