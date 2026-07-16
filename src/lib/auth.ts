"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE } from "./auth-constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010";

export interface SessionUser {
  id: string;
  shopId: string;
  role: "OWNER" | "STAFF";
  name: string;
}

export async function login(
  email: string,
  password: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return { success: false, error: body?.message ?? "เข้าสู่ระบบไม่สำเร็จ" };
    }

    const data = (await res.json()) as { accessToken: string };
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถเชื่อมต่อ pos-backend ได้" };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/auth/login");
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const payloadSegment = token.split(".")[1];
    const json = Buffer.from(payloadSegment, "base64url").toString("utf8");
    const payload = JSON.parse(json);
    return { id: payload.sub, shopId: payload.shopId, role: payload.role, name: payload.name };
  } catch {
    return null;
  }
}
