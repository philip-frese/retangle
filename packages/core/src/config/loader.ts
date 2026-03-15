import path from "path";
import { RetangleConfig, retangleConfigSchema } from "./schema.js";
import { createJiti } from "jiti";

const CONFIG_FILE = "retangle.config.ts";

export async function loadConfig(
  root: string = process.cwd(),
): Promise<RetangleConfig> {
  const configPath = path.resolve(root, CONFIG_FILE);
  const jiti = createJiti(import.meta.url);
  const mod = await jiti.import(configPath);
  const config = (mod as any).default ?? mod;
  const extendedConfig = {
    projectPath: config.projectPath ?? "./",
    tsConfigFilePath:
      config.tsConfigPath ??
      path.resolve(config.projectPath ?? "./", "tsconfig.json"),
    include: config.include ?? [],
    exclude: config.exclude ?? [],
  };
  return retangleConfigSchema.parse(extendedConfig);
}
