import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { router } from "expo-router";
import { Banknote, Repeat, ShoppingBag, User } from "lucide-react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { usePosCart } from "@/contexts/pos-cart";
import { createBill } from "@/lib/pos-api";
import type { PaymentMethod } from "@/lib/pos-types";
import { colors } from "@/lib/theme";

import { CartLineItem } from "./cart-line-item";

// CARD is a valid PaymentMethod on the backend but not offered here yet - add back to this list when ready.
const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "CASH", label: "เงินสด", icon: Banknote },
  { value: "TRANSFER", label: "โอน", icon: Repeat },
];

export function CartRail() {
  const { state, dispatch } = usePosCart();
  const [submitting, setSubmitting] = useState(false);
  const { member, cart, discount, pointsUsed, paymentMethod } = state;
  const bahtPerPoint = state.shop?.bahtPerPoint ?? 50;

  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const pointsDiscountBaht = pointsUsed * bahtPerPoint;
  const total = Math.max(0, subtotal - discount - pointsDiscountBaht);
  const pointsEarnedPreview = member ? Math.floor(total / bahtPerPoint) : 0;
  const maxPointsUsable = member?.pointBalance ?? 0;
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const bump = useSharedValue(1);
  // biome-ignore lint/correctness/useExhaustiveDependencies: only pulse when the count itself changes, not on every render
  useEffect(() => {
    if (cartCount === 0) return;
    bump.value = withSequence(withTiming(1.3, { duration: 100 }), withTiming(1, { duration: 150 }));
  }, [cartCount]);
  const bumpStyle = useAnimatedStyle(() => ({ transform: [{ scale: bump.value }] }));

  async function handleCheckout() {
    if (cart.length === 0) {
      toast.danger("เพิ่มบริการอย่างน้อย 1 รายการก่อนชำระเงิน");
      return;
    }
    if (!paymentMethod) {
      toast.danger("กรุณาเลือกช่องทางชำระเงิน");
      return;
    }
    setSubmitting(true);
    const result = await createBill({
      memberId: member?.id,
      items: cart.map(({ serviceId, quantity }) => ({ serviceId, quantity })),
      discount: discount || undefined,
      pointsUsed: pointsUsed || undefined,
      paymentMethod,
    });
    setSubmitting(false);

    if (!result.success) {
      if (result.error.includes("Member not found")) {
        toast.danger("ไม่พบสมาชิกนี้แล้ว กรุณาเลือกสมาชิกใหม่");
        dispatch({ type: "SET_MEMBER", member: null });
        router.push("/member");
        return;
      }
      toast.danger(result.error);
      return;
    }

    dispatch({ type: "SET_BILL", bill: result.data });
    router.push("/success");
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="border-b p-4" style={{ borderColor: colors.border }}>
        {member ? (
          <Pressable
            onPress={() => router.push("/member")}
            className="flex-row items-center gap-3 rounded-2xl border p-3"
            style={{ borderColor: colors.accentBorder, backgroundColor: colors.accentSoft }}
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.accent }}
            >
              <Text className="font-ui-bold text-[15px]" style={{ color: colors.accentText }}>
                {member.name.charAt(0)}
              </Text>
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-ui-semibold text-[13px] text-text" numberOfLines={1}>
                {member.name}
              </Text>
              <Text className="mt-0.5 text-[11px]" style={{ color: colors.accent }}>
                {member.pointBalance.toLocaleString("th-TH")} คะแนน
              </Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push("/member")}
            className="flex-row items-center gap-3 rounded-2xl border border-dashed p-3"
            style={{ borderColor: colors.borderStrong, backgroundColor: colors.surfaceAlt }}
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.raised }}
            >
              <User size={18} color={colors.muted} />
            </View>
            <View className="flex-1">
              <Text className="font-ui-semibold text-[13px] text-text">ลูกค้า Walk-in</Text>
              <Text className="mt-0.5 text-[11px] text-muted2">แตะเพื่อระบุสมาชิก & สะสมคะแนน</Text>
            </View>
          </Pressable>
        )}
      </View>

      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="font-ui-semibold text-[13px] text-text">รายการบริการ</Text>
        <View className="flex-row items-center gap-2">
          <Animated.Text style={[bumpStyle, { color: colors.muted2, fontSize: 11 }]}>{cartCount} รายการ</Animated.Text>
          {cart.length > 0 && (
            <Pressable onPress={() => dispatch({ type: "CLEAR_CART" })}>
              <Text className="text-[11px]" style={{ color: colors.danger }}>
                ล้างตะกร้า
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerClassName="gap-2 pb-2">
        {cart.length === 0 ? (
          <View className="items-center gap-3 py-10">
            <ShoppingBag size={28} color={colors.muted} />
            <Text className="text-center text-[11px] text-muted">ยังไม่มีรายการ{"\n"}แตะบริการทางซ้ายเพื่อเพิ่ม</Text>
          </View>
        ) : (
          cart.map((line) => (
            <CartLineItem
              key={line.serviceId}
              line={line}
              onIncrement={() => dispatch({ type: "INCREMENT_LINE", serviceId: line.serviceId })}
              onDecrement={() => dispatch({ type: "DECREMENT_LINE", serviceId: line.serviceId })}
              onRemove={() => dispatch({ type: "REMOVE_LINE", serviceId: line.serviceId })}
            />
          ))
        )}
      </ScrollView>

      <View className="gap-3 border-t p-4" style={{ borderColor: colors.border, backgroundColor: colors.surfaceAlt }}>
        <View className="flex-row gap-2">
          {PAYMENT_METHODS.map((method) => (
            <View key={method.value} className="flex-1">
              <Button
                variant={paymentMethod === method.value ? "primary" : "secondary"}
                fullWidth
                onPress={() => dispatch({ type: "SET_PAYMENT_METHOD", method: method.value })}
              >
                {method.label}
              </Button>
            </View>
          ))}
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1 gap-1.5">
            <Text className="font-ui-medium text-[12px] text-text-soft">ส่วนลด (฿)</Text>
            <TextInput
              value={discount === 0 ? "" : String(discount)}
              onChangeText={(value) => dispatch({ type: "SET_DISCOUNT", value: Number(value) || 0 })}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.faint}
              className="rounded-lg border px-3 py-2.5 font-ui text-[14px] text-text"
              style={{ borderColor: colors.borderMid, backgroundColor: colors.inputBg }}
            />
          </View>
          {member && (
            <View className="flex-1 gap-1.5">
              <Text className="font-ui-medium text-[12px] text-text-soft">ใช้คะแนน (มี {member.pointBalance})</Text>
              <TextInput
                value={pointsUsed === 0 ? "" : String(pointsUsed)}
                onChangeText={(value) =>
                  dispatch({
                    type: "SET_POINTS_USED",
                    value: Math.max(0, Math.min(maxPointsUsable, Number(value) || 0)),
                  })
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.faint}
                className="rounded-lg border px-3 py-2.5 font-ui text-[14px] text-text"
                style={{ borderColor: colors.borderMid, backgroundColor: colors.inputBg }}
              />
            </View>
          )}
        </View>

        <View className="gap-1">
          <View className="flex-row justify-between">
            <Text className="text-[13px] text-muted2">ยอดรวมบริการ</Text>
            <Text className="text-[13px] text-text">฿{subtotal.toLocaleString("th-TH")}</Text>
          </View>
          {discount > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-[13px] text-muted2">ส่วนลด</Text>
              <Text className="text-[13px] text-text">-฿{discount.toLocaleString("th-TH")}</Text>
            </View>
          )}
          {pointsUsed > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-[13px] text-muted2">ใช้คะแนน ({pointsUsed})</Text>
              <Text className="text-[13px] text-text">-฿{pointsDiscountBaht.toLocaleString("th-TH")}</Text>
            </View>
          )}
          <View className="flex-row items-end justify-between border-t pt-2" style={{ borderColor: colors.border }}>
            <Text className="font-ui-semibold text-[13px] text-text">ยอดชำระ</Text>
            <Text className="font-bold font-serif text-2xl" style={{ color: colors.accent }}>
              ฿{total.toLocaleString("th-TH")}
            </Text>
          </View>
          {member && (
            <Text className="text-right text-[11px] text-muted2">
              จะได้รับ <Text style={{ color: colors.accent, fontWeight: "600" }}>+{pointsEarnedPreview}</Text> คะแนน
            </Text>
          )}
        </View>

        <Button fullWidth isLoading={submitting} onPress={handleCheckout}>
          {submitting ? "กำลังบันทึก..." : "ยืนยันการชำระเงิน"}
        </Button>
      </View>
    </View>
  );
}
