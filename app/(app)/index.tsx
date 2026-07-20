import { Pressable, Text, useWindowDimensions, View } from "react-native";

import { Image } from "expo-image";
import { router } from "expo-router";
import { History, LogOut, Sparkle, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CartRail } from "@/components/pos/cart-rail";
import { ServiceStep } from "@/components/pos/service-step";
import { usePosCart } from "@/contexts/pos-cart";
import { useSession } from "@/contexts/session";
import { colors } from "@/lib/theme";

export default function PosScreen() {
  const { user, signOut } = useSession();
  const { state } = usePosCart();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View
        className="flex-row items-center justify-between gap-2 border-b px-5 py-3"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <View className="flex-row items-center gap-3">
          {state.shop?.logoUrl ? (
            <Image
              source={{ uri: state.shop.logoUrl }}
              style={{ width: 40, height: 40, borderRadius: 12 }}
              contentFit="cover"
            />
          ) : (
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.accent }}
            >
              <Sparkle size={18} color={colors.accentText} />
            </View>
          )}
          <View>
            <Text className="font-serif text-[15px] text-text leading-tight">{state.shop?.name ?? "POS ขายบริการ"}</Text>
            <Text className="text-[11px] text-muted2">เลือกบริการ · {user?.name}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.push("/member")}
            className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{
              backgroundColor: state.member ? colors.accentSoft : colors.raised,
              borderWidth: state.member ? 1 : 0,
              borderColor: colors.accentBorder,
            }}
          >
            <User size={14} color={state.member ? colors.accent : colors.text} />
            <Text className="font-ui-medium text-[12px]" style={{ color: state.member ? colors.accent : colors.text }}>
              {state.member ? state.member.name.split(" ")[0] : "ระบุลูกค้า"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/history")}
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.raised }}
          >
            <History size={16} color={colors.text} />
          </Pressable>
          <Pressable
            onPress={signOut}
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.raised }}
          >
            <LogOut size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View className={isWide ? "flex-1 flex-row" : "flex-1"}>
        <View className="flex-1">
          <ServiceStep />
        </View>
        <View
          className={isWide ? "border-l" : "border-t"}
          style={{ borderColor: colors.border, width: isWide ? 380 : undefined, height: isWide ? undefined : 380 }}
        >
          <CartRail />
        </View>
      </View>
    </View>
  );
}
