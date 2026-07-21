import { createContext, type PropsWithChildren, use, useCallback, useEffect, useState } from "react";

import { useSession } from "@/contexts/session";
import { getMySubscription } from "@/lib/pos-api";
import type { MySubscription } from "@/lib/pos-types";

interface SubscriptionContextValue {
  subscription: MySubscription | null;
  refresh: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function useSubscriptionStatus() {
  const value = use(SubscriptionContext);
  if (!value) throw new Error("useSubscriptionStatus must be used within a <SubscriptionProvider />");
  return value;
}

// Shared across the POS header (index.tsx) and the purchase screen (subscription.tsx) so a
// completed purchase is reflected immediately everywhere, instead of index.tsx (which never
// unmounts - it's the base of the stack) showing whatever it fetched once on first mount.
export function SubscriptionProvider({ children }: PropsWithChildren) {
  const { user } = useSession();
  const [subscription, setSubscription] = useState<MySubscription | null>(null);

  const refresh = useCallback(() => {
    if (user?.role !== "OWNER") return;
    void getMySubscription().then((result) => {
      if (result.success) setSubscription(result.data);
    });
  }, [user?.role]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // The header pill/popup on index.tsx only update when this refetches - and index.tsx never
  // unmounts, so an owner sitting on the POS home screen (no other API calls firing) would
  // otherwise never notice a platform admin changing their package until they happened to
  // navigate somewhere. Poll periodically to catch that case too.
  useEffect(() => {
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return <SubscriptionContext value={{ subscription, refresh }}>{children}</SubscriptionContext>;
}
