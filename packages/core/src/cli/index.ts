import { program } from "commander";
import { loadConfig } from "../config/index.js";
import { createRetangleServer } from "../server/index.js";
import { runAnalysis } from "./dev.js";
import type { RetangleConfig } from "../config/schema.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

program
  .name("retangle")
  .description("Visualize React hook dependencies in your project")
  .option("-p, --project <path>", "Path to the project root")
  .option("-t, --tsconfig <path>", "Path to tsconfig.json")
  .option("-i, --include <globs...>", "Glob patterns to include")
  .option("-e, --exclude <globs...>", "Glob patterns to exclude")
  .option("--port <number>", "Port for the UI server", "7777")
  .action(async (opts) => {
    const fileConfig = await loadConfig(opts.project).catch(
      () => ({}) as Partial<RetangleConfig>,
    );
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const uiDistPath = path.resolve(__dirname, "../../../ui/dist");

    const config: RetangleConfig = {
      projectPath: opts.project ?? fileConfig.projectPath ?? process.cwd(),
      tsConfigFilePath:
        opts.tsconfig ?? fileConfig.tsConfigFilePath ?? "tsconfig.json",
      include: opts.include ?? fileConfig.include ?? [],
      exclude: opts.exclude ?? fileConfig.exclude ?? [],
    };

    const server = createRetangleServer(Number(opts.port), uiDistPath);
    server.start();

    const graph = await runAnalysis(config);
    server.update(graph);

    server.watch(config.projectPath, async () => {
      const updated = await runAnalysis(config);
      server.update(updated);
    });
  });

program.parse();
