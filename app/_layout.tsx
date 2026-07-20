import "../global.css";

import { View } from "react-native";

import {
  Anuphan_400Regular,
  Anuphan_500Medium,
  Anuphan_600SemiBold,
  Anuphan_700Bold,
} from "@expo-google-fonts/anuphan";
import { NotoSerifThai_600SemiBold } from "@expo-google-fonts/noto-serif-thai";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "@/lib/theme";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Anuphan_400Regular,
    Anuphan_500Medium,
    Anuphan_600SemiBold,
    Anuphan_700Bold,
    NotoSerifThai_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
