import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/lib/theme";

type ToastVariant = "success" | "danger";
interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

let nextId = 0;
let listener: ((item: ToastItem) => void) | null = null;

function show(message: string, variant: ToastVariant) {
  nextId += 1;
  listener?.({ id: nextId, message, variant });
}

export const toast = {
  success: (message: string) => show(message, "success"),
  danger: (message: string) => show(message, "danger"),
};

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const insets = useSafeAreaInsets();
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    listener = (item) => {
      setItems((prev) => [...prev, item]);
      const timer = setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        timers.current.delete(item.id);
      }, 3000);
      timers.current.set(item.id, timer);
    };
    return () => {
      listener = null;
      for (const t of timers.current.values()) clearTimeout(t);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <View pointerEvents="none" className="absolute inset-x-0 z-50 gap-2 px-4" style={{ top: insets.top + 8 }}>
      {items.map((item) => (
        <Animated.View
          key={item.id}
          entering={FadeInDown}
          exiting={FadeOutUp}
          className="rounded-lg border px-4 py-3"
          style={{
            backgroundColor: item.variant === "danger" ? colors.dangerSoft : colors.successSoft,
            borderColor: item.variant === "danger" ? colors.danger : colors.success,
          }}
        >
          <Text
            className="font-ui-medium text-[14px]"
            style={{ color: item.variant === "danger" ? colors.danger : colors.success }}
          >
            {item.message}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}
