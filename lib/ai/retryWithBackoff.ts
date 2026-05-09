interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  shouldRetry: (error: Error) => error.message.includes("429"),
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries, baseDelay, shouldRetry } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries + 1}, waiting ${delay}ms`);
        await sleep(delay);
      }

      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries && shouldRetry(lastError, attempt)) {
        console.warn(`[Retry] Recoverable error on attempt ${attempt + 1}:`, lastError.message);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error("Unknown error in retry loop");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}