import path from "path";
import { RetangleConfig, retangleConfigSchema } from "./schema.js";
import { createJiti } from "jiti";

const CONFIG_FILE = "retangle.config.ts";

/**
 * Loads and validates the Retangle config from `retangle.config.ts`.
 *
 * Uses jiti to execute the TypeScript config file directly, applies defaults
 * for any omitted fields, then validates the result against the schema.
 *
 * @param root - Directory to search for the config file. Defaults to `process.cwd()`.
 * @throws {ZodError} If the config file exports an invalid configuration.
 * @throws If the config file cannot be found or executed.
 */
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
