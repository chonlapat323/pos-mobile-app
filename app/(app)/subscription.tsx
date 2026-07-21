import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";

import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";
import { useSession } from "@/contexts/session";
import { useSubscriptionStatus } from "@/contexts/subscription";
import { createOmiseToken } from "@/lib/omise";
import { getMySubscription, getPurchaseStatus, getSubscriptionPackages, purchaseSubscription } from "@/lib/pos-api";
import type { MySubscription, PackageCode, SubscriptionPackage, SubscriptionPurchase } from "@/lib/pos-types";
import { colors } from "@/lib/theme";

type PaymentMethod = "PROMPTPAY" | "CARD";

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return (digits.match(/.{1,4}/g) ?? []).join(" ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

const STATUS_LABELS: Record<MySubscription["subscriptionStatus"], string> = {
  PENDING: "รอชำระเงิน",
  TRIALING: "กำลังทดลองใช้ฟรี",
  ACTIVE: "ใช้งานอยู่",
  EXPIRED: "หมดอายุแล้ว",
};

const PACKAGE_DURATION_LABELS: Record<PackageCode, string> = {
  TRIAL_60: "60 วัน",
  SIX_MONTH: "6 เดือน",
  ONE_YEAR: "12 เดือน",
};

function perMonthLabel(pkg: SubscriptionPackage) {
  const perMonth = Math.round(pkg.priceThb / (pkg.durationDays / 30));
  return `฿${perMonth.toLocaleString("th-TH")} / เดือน`;
}

function statusColorFor(status: MySubscription["subscriptionStatus"] | undefined) {
  if (status === "EXPIRED") return colors.danger;
  if (status === "ACTIVE") return colors.success;
  return colors.accent;
}

// Matches the backend's RENEWAL_WINDOW_DAYS (subscriptions.service.ts) - renewal only opens up
// this close to expiry so a shop already on its top package can't just keep re-buying and
// silently discarding whatever time it has left.
const RENEWAL_WINDOW_DAYS = 7;

function daysUntil(dateIso: string) {
  return Math.ceil((new Date(dateIso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export default function SubscriptionScreen() {
  const { user } = useSession();
  const { refresh: refreshSharedSubscription } = useSubscriptionStatus();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MySubscription | null>(null);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchase, setPurchase] = useState<SubscriptionPurchase | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PROMPTPAY");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [meResult, packagesResult] = await Promise.all([getMySubscription(), getSubscriptionPackages()]);
    setLoading(false);
    if (!meResult.success) {
      toast.danger(meResult.error);
      return;
    }
    if (!packagesResult.success) {
      toast.danger(packagesResult.error);
      return;
    }
    setMe(meResult.data);
    setPackages(packagesResult.data);
    setSelectedId((current) => current ?? packagesResult.data.find((p) => p.code === "ONE_YEAR")?.id ?? null);
  }, []);

  useEffect(() => {
    if (user && user.role !== "OWNER") {
      router.back();
      return;
    }
    void load();
  }, [user, load]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function startPolling(paymentId: string) {
    pollRef.current = setInterval(async () => {
      const statusResult = await getPurchaseStatus(paymentId);
      if (!statusResult.success) return;
      if (statusResult.data.status === "PAID") {
        if (pollRef.current) clearInterval(pollRef.current);
        setPurchase(null);
        toast.success("ชำระเงินสำเร็จ ต่ออายุแพ็กเกจแล้ว");
        void load();
        refreshSharedSubscription();
      } else if (statusResult.data.status === "FAILED") {
        if (pollRef.current) clearInterval(pollRef.current);
        setPurchase(null);
        toast.danger("การชำระเงินไม่สำเร็จ กรุณาลองใหม่");
      }
    }, 3000);
  }

  async function handleSubscribe() {
    if (!selectedId) return;

    let omiseToken: string | null = null;
    if (paymentMethod === "CARD") {
      const [month, year] = cardExpiry.split("/");
      if (!cardNumber || !cardName || !month || !year || !cardCvv) {
        toast.danger("กรุณากรอกข้อมูลบัตรให้ครบ");
        return;
      }
      setPurchasing(true);
      try {
        omiseToken = await createOmiseToken({
          number: cardNumber,
          name: cardName,
          expirationMonth: Number(month),
          expirationYear: 2000 + Number(year),
          securityCode: cardCvv,
        });
      } catch (error) {
        setPurchasing(false);
        toast.danger(error instanceof Error ? error.message : "ไม่สามารถอ่านข้อมูลบัตรได้");
        return;
      }
    } else {
      setPurchasing(true);
    }

    const result = await purchaseSubscription(
      selectedId,
      omiseToken ? { method: "CARD", omiseToken } : { method: "PROMPTPAY" },
    );
    setPurchasing(false);
    if (!result.success) {
      toast.danger(result.error);
      return;
    }

    if (result.data.authorizeUri) {
      // 3D Secure required - the card issuer needs to confirm this in their own page before the
      // charge resolves. Send the owner there, then poll the same way as everything else.
      void Linking.openURL(result.data.authorizeUri);
    }
    setPurchase(result.data);
    startPolling(result.data.paymentId);
  }

  const selectedPackage = packages.find((p) => p.id === selectedId) ?? null;
  const statusColor = statusColorFor(me?.subscriptionStatus);
  const minPurchasableDurationDays = me?.subscriptionStatus === "ACTIVE" ? (me.currentPackage?.durationDays ?? 0) : 0;

  const highestPackage = packages.reduce<SubscriptionPackage | null>(
    (max, pkg) => (!max || pkg.durationDays > max.durationDays ? pkg : max),
    null,
  );
  const isOnHighestTier =
    me?.subscriptionStatus === "ACTIVE" && highestPackage !== null && me.currentPackage?.code === highestPackage.code;
  const daysLeft = me?.subscriptionEndsAt ? daysUntil(me.subscriptionEndsAt) : null;
  const renewalLocked = isOnHighestTier && daysLeft !== null && daysLeft > RENEWAL_WINDOW_DAYS;
  const isRenewal = me?.subscriptionStatus === "ACTIVE";

  if (purchase) {
    return (
      <View
        className="flex-1 items-center justify-center gap-5 px-6"
        style={{ backgroundColor: colors.bg, paddingTop: insets.top }}
      >
        {purchase.qrImageUri ? (
          <>
            <Text className="font-serif text-[18px] text-text">สแกน QR เพื่อชำระผ่าน PromptPay</Text>
            <View className="rounded-2xl p-4" style={{ backgroundColor: colors.receiptPaper }}>
              <Image source={{ uri: purchase.qrImageUri }} style={{ width: 240, height: 240 }} resizeMode="contain" />
            </View>
          </>
        ) : (
          <Text className="font-serif text-[18px] text-text">
            {purchase.authorizeUri ? "กรุณายืนยันตัวตนกับธนาคารในหน้าที่เปิดขึ้น" : "กำลังตรวจสอบการชำระเงิน..."}
          </Text>
        )}
        <Text className="text-center text-[12px] text-muted">ระบบจะอัปเดตสถานะอัตโนมัติเมื่อชำระเงินสำเร็จ กรุณาอย่าปิดหน้านี้</Text>
        <Button
          variant="secondary"
          onPress={() => {
            if (pollRef.current) clearInterval(pollRef.current);
            setPurchase(null);
          }}
        >
          ยกเลิก
        </Button>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 border-b p-4" style={{ borderColor: colors.border }}>
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: colors.raised }}
        >
          <ChevronLeft size={18} color={colors.text} />
        </Pressable>
        <Text className="font-serif text-[17px] text-text">แพ็กเกจของร้าน</Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerClassName="gap-4 py-4">
        {loading || !me ? (
          <Text className="font-ui text-[13px] text-muted">กำลังโหลด...</Text>
        ) : (
          <>
            <View
              className="gap-1 rounded-2xl border p-4"
              style={{ borderColor: colors.border, backgroundColor: colors.card }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="font-ui-semibold text-[14px] text-text">
                  {me.currentPackage?.name ?? "ยังไม่มีแพ็กเกจ"}
                </Text>
                <Text className="font-ui-semibold text-[12px]" style={{ color: statusColor }}>
                  {STATUS_LABELS[me.subscriptionStatus]}
                </Text>
              </View>
              {me.subscriptionEndsAt && (
                <Text className="text-[12px] text-muted2">
                  {me.subscriptionStatus === "EXPIRED" ? "หมดอายุเมื่อ" : "ใช้งานได้ถึง"}{" "}
                  {new Date(me.subscriptionEndsAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              )}
              <Pressable onPress={() => router.push("/subscription-history")} className="mt-1">
                <Text className="font-ui-medium text-[12px]" style={{ color: colors.accent }}>
                  ดูประวัติการชำระเงิน
                </Text>
              </Pressable>
            </View>

            {renewalLocked ? (
              <View
                className="gap-1 rounded-2xl border p-4"
                style={{ borderColor: colors.border, backgroundColor: colors.card }}
              >
                <Text className="font-ui-semibold text-[13px] text-text">
                  คุณใช้แพ็กเกจสูงสุด ({highestPackage?.name}) อยู่แล้ว
                </Text>
                <Text className="text-[12px] text-muted2">
                  จะสามารถต่ออายุได้เมื่อเหลือเวลาใช้งาน ≤{RENEWAL_WINDOW_DAYS} วันก่อนหมดอายุ
                </Text>
              </View>
            ) : (
              <>
                <Text className="font-ui-semibold text-[14px] text-text">เลือกแพ็กเกจ</Text>
                {isRenewal && (
                  <Text className="-mt-2 text-[11px] text-muted2">
                    ต่ออายุตอนนี้จะได้รับเวลาใช้งานเพิ่มต่อจากวันหมดอายุเดิม ไม่เสียเวลาที่เหลืออยู่
                  </Text>
                )}

                {packages.map((pkg) => {
                  const isHighlight = pkg.code === "ONE_YEAR";
                  const isSelected = selectedId === pkg.id;
                  const isCurrent = me.subscriptionStatus === "ACTIVE" && me.currentPackage?.code === pkg.code;
                  const isDisabled = pkg.durationDays < minPurchasableDurationDays;
                  return (
                    <Pressable
                      key={pkg.id}
                      disabled={isDisabled}
                      onPress={() => setSelectedId(pkg.id)}
                      className="gap-2 rounded-2xl border p-4"
                      style={{
                        borderColor: isSelected ? colors.accent : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                        backgroundColor: isHighlight ? colors.accentSoft : colors.card,
                        opacity: isDisabled ? 0.4 : 1,
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="font-ui-semibold text-[15px] text-text">{pkg.name}</Text>
                        <View className="flex-row gap-1.5">
                          {isCurrent && (
                            <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: colors.accentSoft }}>
                              <Text className="font-ui-medium text-[11px]" style={{ color: colors.accent }}>
                                แพ็กเกจปัจจุบัน
                              </Text>
                            </View>
                          )}
                          <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: colors.raised }}>
                            <Text className="font-ui-medium text-[11px] text-muted2">
                              {PACKAGE_DURATION_LABELS[pkg.code]}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View className="flex-row items-end gap-2">
                        <Text className="font-ui-bold text-[26px] text-text">
                          ฿{pkg.priceThb.toLocaleString("th-TH")}
                        </Text>
                        <Text className="mb-1 text-[12px] text-muted2">{perMonthLabel(pkg)}</Text>
                      </View>
                      {isHighlight && (
                        <Text className="font-ui-medium text-[11px]" style={{ color: colors.accent }}>
                          คุ้มที่สุด
                        </Text>
                      )}
                    </Pressable>
                  );
                })}

                <View className="gap-2 pt-2">
                  <Text className="font-ui-semibold text-[13px] text-text">วิธีชำระเงิน</Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setPaymentMethod("PROMPTPAY")}
                      className="flex-1 items-center rounded-lg border py-2.5"
                      style={{
                        borderColor: paymentMethod === "PROMPTPAY" ? colors.accent : colors.border,
                        borderWidth: paymentMethod === "PROMPTPAY" ? 2 : 1,
                        backgroundColor: colors.card,
                      }}
                    >
                      <Text className="font-ui-medium text-[13px] text-text">พร้อมเพย์ (QR)</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setPaymentMethod("CARD")}
                      className="flex-1 items-center rounded-lg border py-2.5"
                      style={{
                        borderColor: paymentMethod === "CARD" ? colors.accent : colors.border,
                        borderWidth: paymentMethod === "CARD" ? 2 : 1,
                        backgroundColor: colors.card,
                      }}
                    >
                      <Text className="font-ui-medium text-[13px] text-text">บัตรเครดิต/เดบิต</Text>
                    </Pressable>
                  </View>

                  {paymentMethod === "CARD" && (
                    <View className="gap-3 pt-1">
                      <TextField
                        label="หมายเลขบัตร"
                        placeholder="4242 4242 4242 4242"
                        keyboardType="number-pad"
                        value={cardNumber}
                        onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                      />
                      <TextField label="ชื่อบนบัตร" placeholder="ชื่อ-นามสกุล" value={cardName} onChangeText={setCardName} />
                      <View className="flex-row gap-3">
                        <View className="flex-1">
                          <TextField
                            label="วันหมดอายุ"
                            placeholder="MM/YY"
                            keyboardType="number-pad"
                            value={cardExpiry}
                            onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                          />
                        </View>
                        <View className="flex-1">
                          <TextField
                            label="CVV"
                            placeholder="123"
                            keyboardType="number-pad"
                            secureTextEntry
                            maxLength={4}
                            value={cardCvv}
                            onChangeText={setCardCvv}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      {!loading && me && !renewalLocked && (
        <View className="border-t p-4" style={{ borderColor: colors.border }}>
          <Button isLoading={purchasing} isDisabled={!selectedPackage} onPress={handleSubscribe} fullWidth>
            {selectedPackage ? `ชำระเงิน — ฿${selectedPackage.priceThb.toLocaleString("th-TH")}` : "เลือกแพ็กเกจ"}
          </Button>
        </View>
      )}
    </View>
  );
}
