

export function isError(err: unknown): err is Error {
  return typeof err === "object" && err !== null && "message" in err;
}

export const wait = (ms: number = 3000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export function runInBackground({
  promise,
  taskName,
}: {
  promise: Promise<unknown>;
  taskName?: string;
}) {
  void (async () => {
    try {
      await promise;
      if (taskName) console.info(`[BG] ${taskName} completed`);
    } catch (err) {
      console.error(`[BG] ${taskName ?? "Background task"} failed:`, err);
    }
  })();
}

export function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength
    ? text.slice(0, maxLength).trim() + "..." + text.slice(-4)
    : text;
}

export function ToPascalCase(val: string) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}
