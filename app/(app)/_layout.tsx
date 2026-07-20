import { Stack } from "expo-router";

import { PosCartProvider } from "@/contexts/pos-cart";
import { colors } from "@/lib/theme";

export default function AppLayout() {
  return (
    <PosCartProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="member" options={{ presentation: "modal" }} />
        <Stack.Screen name="history" options={{ presentation: "modal" }} />
        <Stack.Screen name="success" options={{ presentation: "modal", gestureEnabled: false }} />
        <Stack.Screen name="subscription" options={{ presentation: "modal" }} />
        <Stack.Screen name="subscription-history" options={{ presentation: "modal" }} />
      </Stack>
    </PosCartProvider>
  );
}
