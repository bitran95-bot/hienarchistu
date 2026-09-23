/** Bound the entire request, including response parsing, and cancel on timeout. */
export async function withTimeout<T>(
  request: (signal: AbortSignal) => Promise<T>,
  timeoutMs = 12_000,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      request(controller.signal),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('Request timed out'));
          controller.abort();
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
