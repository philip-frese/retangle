import z from "zod";

export const retangleConfigSchema = z.object({
  projectPath: z.string(),
  tsConfigFilePath: z.string(),
  include: z.array(z.string()),
  exclude: z.array(z.string()),
});

export type RetangleConfig = z.infer<typeof retangleConfigSchema>;

export const defineConfig = (
  config: Partial<RetangleConfig>,
): Partial<RetangleConfig> => config;
