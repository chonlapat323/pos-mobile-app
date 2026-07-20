import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="font-serif text-2xl text-text">POS ขายบริการ</Text>
      <Text className="mt-2 font-ui text-muted2">Milestone 1 — Expo + NativeWind + theme wired up</Text>
      <View className="mt-6 rounded-lg border border-accent-border bg-accent-soft px-4 py-2">
        <Text className="font-ui-semibold text-accent">accent token check</Text>
      </View>
    </View>
  );
}
