import { getToken } from "./auth-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3010";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public reason?: string,
  ) {
    super(message);
  }
}

// A 401 with a `reason` means the strict JwtStrategy blocked the request because the shop itself
// is suspended (see backend jwt.strategy.ts) - as opposed to a plain expired/invalid token, which
// carries no `reason`. Registered once from the session context so any api call, anywhere in the
// app, can force a re-fetch/redirect the moment it discovers the shop's subscription changed
// underneath an already-open session - not just the screens that poll for it directly.
type ShopSuspendedListener = (reason: string) => void;
let shopSuspendedListener: ShopSuspendedListener | null = null;

export function setShopSuspendedListener(listener: ShopSuspendedListener | null) {
  shopSuspendedListener = listener;
}

async function throwIfError(res: Response, path: string): Promise<void> {
  if (res.ok) return;
  const body = await res.json().catch(() => null);
  if (res.status === 401 && body?.reason) {
    shopSuspendedListener?.(body.reason);
  }
  throw new ApiError(body?.message ?? `Request to ${path} failed with ${res.status}`, res.status, body?.reason);
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  await throwIfError(res, path);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Separate from apiFetch because a multipart upload must NOT have Content-Type set manually -
// fetch needs to generate it itself (with the multipart boundary) from the FormData body.
export async function apiUpload<T>(path: string, file: { uri: string; name: string; type: string }): Promise<T> {
  const token = await getToken();

  const formData = new FormData();
  // React Native's fetch accepts this {uri, name, type} shape as a file part, unlike web FormData
  // which expects an actual Blob/File.
  formData.append("file", { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  await throwIfError(res, path);
  return (await res.json()) as T;
}
