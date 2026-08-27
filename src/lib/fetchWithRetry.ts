/**
 * Robust fetch wrapper with retry logic, timeout, and error handling.
 * Handles flaky mobile networks, SSL issues, and transient failures.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  timeoutMs = 10000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `[fetchWithRetry] Attempt ${attempt}/${retries} failed for ${url}:`,
        lastError.message
      );

      if (attempt < retries) {
        // Exponential backoff: 500ms, 1000ms, 2000ms...
        const delay = Math.min(500 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

/**
 * Fetches JSON data from Directus with retry and error handling.
 * Returns { data, error } so components can handle failures gracefully.
 */
export async function fetchDirectusData<T = unknown>(
  url: string,
  retries = 3
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetchWithRetry(url, {}, retries);
    const json = await response.json();

    if (json.data !== undefined) {
      return { data: json.data as T, error: null };
    }

    // Some Directus responses don't wrap in .data
    return { data: json as T, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[fetchDirectusData] Failed to load from ${url}:`, message);
    return { data: null, error: message };
  }
}
