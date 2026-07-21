import { createContext, type PropsWithChildren, use, useCallback, useEffect, useRef, useState } from "react";

import { router } from "expo-router";

import { toast } from "@/components/ui/toast";
import { setShopSuspendedListener } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/auth-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3010";

export interface SessionUser {
  id: string;
  shopId: string;
  role: "OWNER" | "STAFF";
  name: string;
}

function decodeUser(token: string): SessionUser | null {
  try {
    const payloadSegment = token.split(".")[1];
    // atob() returns a binary string (one JS char per byte, Latin-1), not UTF-8 text - decoding
    // it directly with JSON.parse mangles any non-ASCII characters (Thai names, in this app's
    // case). Re-interpret those bytes as UTF-8 before parsing.
    const binary = atob(payloadSegment.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const payload = JSON.parse(json);
    return { id: payload.sub, shopId: payload.shopId, role: payload.role, name: payload.name };
  } catch {
    return null;
  }
}

interface SessionContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: true; subscriptionExpired: boolean } | { success: false; error: string }>;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const value = use(SessionContext);
  if (!value) throw new Error("useSession must be used within a <SessionProvider />");
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getToken().then((token) => {
      setUser(token ? decodeUser(token) : null);
      setIsLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        return { success: false as const, error: body?.message ?? "เข้าสู่ระบบไม่สำเร็จ" };
      }

      const data = (await res.json()) as { accessToken: string; subscriptionExpired?: boolean };
      await setToken(data.accessToken);
      setUser(decodeUser(data.accessToken));
      return { success: true as const, subscriptionExpired: data.subscriptionExpired ?? false };
    } catch {
      return { success: false as const, error: "ไม่สามารถเชื่อมต่อ pos-backend ได้" };
    }
  }, []);

  const signOut = useCallback(() => {
    void clearToken();
    setUser(null);
  }, []);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Fires from apiFetch() the instant ANY request - not just a dedicated poll - discovers the
  // shop was suspended after this session already logged in (eg. a platform admin cancelled its
  // subscription while the app was open). An owner suspended only for a lapsed subscription can
  // still reach the purchase screen; every other case (staff, or a manual admin suspension) can't
  // do anything once suspended, so there's nothing left to do but sign out.
  useEffect(() => {
    setShopSuspendedListener((reason) => {
      if (userRef.current?.role === "OWNER" && reason === "SUBSCRIPTION_EXPIRED") {
        toast.danger("แพ็กเกจของร้านหมดอายุแล้ว กรุณาต่ออายุเพื่อใช้งานต่อ");
        router.replace("/subscription");
        return;
      }
      toast.danger(
        reason === "SUBSCRIPTION_EXPIRED"
          ? "แพ็กเกจของร้านหมดอายุแล้ว กรุณาติดต่อเจ้าของร้านเพื่อต่ออายุ"
          : "ร้านถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
      );
      signOut();
    });
    return () => setShopSuspendedListener(null);
  }, [signOut]);

  return <SessionContext value={{ user, isLoading, signIn, signOut }}>{children}</SessionContext>;
}
