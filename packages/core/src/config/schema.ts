import z from "zod";

/**
 * Zod schema for validating a resolved Retangle configuration.
 * All fields are required — defaults are applied by the loader before parsing.
 */
export const retangleConfigSchema = z.object({
  projectPath: z.string(),
  tsConfigFilePath: z.string(),
  include: z.array(z.string()),
  exclude: z.array(z.string()),
});

/** Fully resolved Retangle configuration with all defaults applied. */
export type RetangleConfig = z.infer<typeof retangleConfigSchema>;

/**
 * Type helper for `retangle.config.ts`. All fields are optional — the loader
 * fills in defaults for any that are omitted.
 *
 * @example
 * // retangle.config.ts
 * import { defineConfig } from "@retangle/core";
 * export default defineConfig({ projectPath: "./src" });
 */
export const defineConfig = (
  config: Partial<RetangleConfig>,
): Partial<RetangleConfig> => config;
