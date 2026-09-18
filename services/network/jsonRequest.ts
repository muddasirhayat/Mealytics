export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

const DEFAULT_TIMEOUT_MS = 8000;
export const APP_USER_AGENT = 'Mealytics/1.0 (https://world.openfoodfacts.org)';

const buildQuery = (params: Record<string, string>): string =>
  Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

export const withQuery = (url: string, params: Record<string, string>): string =>
  `${url}?${buildQuery(params)}`;

/**
 * GET JSON using React Native fetch (EXPO_PUBLIC_USE_RN_FETCH=1).
 * No AbortSignal — Android often reports aborted USDA/OFF calls as generic network errors.
 */
export const jsonRequest = <T>(url: string, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<T> =>
  new Promise((resolve, reject) => {
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback();
    };

    const timer = setTimeout(() => {
      finish(() => {
        reject(new NetworkError('Request timed out. Check your connection and try again.'));
      });
    }, timeoutMs);

    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-User-Agent': APP_USER_AGENT,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new NetworkError(
            `Could not search foods right now (HTTP ${response.status}). Please try again.`,
            response.status
          );
        }
        return response.json() as Promise<T>;
      })
      .then((data) => {
        finish(() => resolve(data));
      })
      .catch((error) => {
        finish(() => {
          if (error instanceof NetworkError) {
            reject(error);
            return;
          }
          reject(new NetworkError('Network error. Check your connection and try again.'));
        });
      });
  });
