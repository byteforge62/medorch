export class ApiClientError extends Error {
  status: number;
  details?: unknown;
  requestId?: string;

  constructor(
    message: string,
    status: number,
    details?: unknown,
    requestId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
    this.requestId = requestId;
  }
}

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  details?: unknown;
  requestId?: string;
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new ApiClientError(
      `HTTP Error ${response.status}: ${response.statusText}`,
      response.status,
    );
  }

  if (!response.ok || json.success === false) {
    throw new ApiClientError(
      json.message || 'An unexpected error occurred',
      response.status,
      json.details,
      json.requestId,
    );
  }

  return json.data as T;
}

/**
 * In-flight GET requests are shared so that several widgets mounting on the
 * same screen (dashboard overview, room grid, alert summary, schedule list)
 * produce one network request instead of one per component. Only concurrent
 * requests are coalesced: once a request settles the key is released, so an
 * explicit Refresh always reaches the network again.
 */
const inflightGets = new Map<string, Promise<unknown>>();

function getShared<T>(url: string, options?: RequestInit): Promise<T> {
  const key = `${url}|${JSON.stringify(options?.headers ?? {})}`;
  const existing = inflightGets.get(key);
  if (existing) return existing as Promise<T>;

  const pending = request<T>(url, { ...options, method: 'GET' }).finally(() => {
    inflightGets.delete(key);
  });
  inflightGets.set(key, pending);
  return pending;
}

export const apiClient = {
  get: <T>(url: string, options?: RequestInit) => getShared<T>(url, options),

  post: <T>(url: string, body?: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(url: string, body?: unknown, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'DELETE' }),
};
