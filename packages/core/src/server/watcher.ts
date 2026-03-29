import chokidar from "chokidar";

export function createWatcher(
  watchPath: string,
  onUpdate: () => void,
): () => void {
  const watcher = chokidar.watch(watchPath, {
    ignoreInitial: true,
    ignored: /node_modules/,
  });

  watcher.on("change", onUpdate);
  watcher.on("add", onUpdate);
  watcher.on("unlink", onUpdate);

  return () => watcher.close();
}
