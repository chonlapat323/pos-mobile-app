const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010";

export interface HealthResponse {
  status: string;
  service: string;
}

export async function getApiHealth(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}
