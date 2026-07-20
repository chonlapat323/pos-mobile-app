import { useEffect, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";

import { Image } from "expo-image";
import { router } from "expo-router";
import { CreditCard, History, LogOut, Sparkle, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CartRail } from "@/components/pos/cart-rail";
import { ServiceStep } from "@/components/pos/service-step";
import { Button } from "@/components/ui/button";
import { usePosCart } from "@/contexts/pos-cart";
import { useSession } from "@/contexts/session";
import { useSubscriptionStatus } from "@/contexts/subscription";
import { colors } from "@/lib/theme";

const EXPIRY_WARNING_DAYS = 7;

function daysUntil(dateIso: string) {
  return Math.ceil((new Date(dateIso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export default function PosScreen() {
  const { user, signOut } = useSession();
  const { state } = usePosCart();
  const { subscription } = useSubscriptionStatus();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  const [showExpiryWarning, setShowExpiryWarning] = useState(false);

  useEffect(() => {
    if (
      subscription &&
      (subscription.subscriptionStatus === "TRIALING" || subscription.subscriptionStatus === "ACTIVE") &&
      subscription.subscriptionEndsAt &&
      daysUntil(subscription.subscriptionEndsAt) <= EXPIRY_WARNING_DAYS
    ) {
      setShowExpiryWarning(true);
    }
  }, [subscription]);

  const daysLeft = subscription?.subscriptionEndsAt ? daysUntil(subscription.subscriptionEndsAt) : null;
  const isExpiringSoon = daysLeft !== null && daysLeft <= EXPIRY_WARNING_DAYS;

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
            <Text className="font-serif text-[15px] text-text leading-tight">{state.shop?.name ?? "POS Services"}</Text>
            <Text className="text-[11px] text-muted2">เลือกบริการ · {user?.name}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          {user?.role === "OWNER" && (
            <Pressable
              onPress={() => router.push("/subscription")}
              className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                backgroundColor: isExpiringSoon ? colors.dangerSoft : colors.raised,
              }}
            >
              <CreditCard size={14} color={isExpiringSoon ? colors.danger : colors.text} />
              <Text
                className="font-ui-medium text-[11px]"
                style={{ color: isExpiringSoon ? colors.danger : colors.text }}
              >
                {daysLeft !== null ? `เหลือ ${daysLeft} วัน` : "แพ็กเกจ"}
              </Text>
            </Pressable>
          )}
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

      {showExpiryWarning && daysLeft !== null && (
        <View
          className="absolute inset-0 items-center justify-center px-8"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <View
            className="w-full max-w-sm gap-3 rounded-2xl border p-5"
            style={{ borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text className="font-serif text-[17px] text-text">
              {daysLeft <= 0 ? "แพ็กเกจของร้านหมดอายุแล้ว" : `แพ็กเกจของร้านใกล้หมดอายุ`}
            </Text>
            <Text className="text-[13px] text-muted2">
              {daysLeft <= 0 ? "กรุณาต่ออายุแพ็กเกจเพื่อใช้งานต่อ" : `เหลืออีก ${daysLeft} วัน กรุณาต่ออายุเพื่อไม่ให้ร้านถูกระงับ`}
            </Text>
            <View className="flex-row gap-2 pt-1">
              <Button variant="secondary" className="flex-1" onPress={() => setShowExpiryWarning(false)}>
                ปิด
              </Button>
              <Button
                className="flex-1"
                onPress={() => {
                  setShowExpiryWarning(false);
                  router.push("/subscription");
                }}
              >
                ต่ออายุตอนนี้
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
