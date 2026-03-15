import { Project } from "ts-morph";
import fg from "fast-glob";
import { type RetangleConfig } from "../config/index.js";

/**
 * Constructs a ts-morph `Project` from the resolved Retangle config.
 *
 * Initialises the TypeScript compiler using the project's `tsconfig.json`,
 * then resolves the file list via fast-glob using the `include`/`exclude`
 * patterns and adds them to the project.
 *
 * @param config - Fully resolved Retangle configuration.
 * @returns A ts-morph `Project` instance with all matching source files added.
 */
export async function buildProject(config: RetangleConfig): Promise<Project> {
  const project = new Project({
    tsConfigFilePath: config.tsConfigFilePath,
    skipAddingFilesFromTsConfig: true,
  });

  const files = await fg(config.include, {
    cwd: config.projectPath,
    ignore: config.exclude,
    absolute: true,
  });

  project.addSourceFilesAtPaths(files);

  return project;
}
