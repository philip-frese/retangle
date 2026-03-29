import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage, Server } from "node:http";
import type { Graph } from "@retangle/types";

export interface WsServer {
  broadcast: (graph: Graph) => void;
}

export function createWsServer(httpServer: Server<typeof IncomingMessage>): WsServer {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.on("close", () => console.log("Client disconnected"));
  });

  return {
    broadcast: (graph: Graph) => {
      const payload = JSON.stringify({ type: "graph:update", data: graph });
      for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      }
    },
  };
}