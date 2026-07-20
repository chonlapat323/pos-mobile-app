import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useSession } from "@/contexts/session";
import { getMySubscription, getPurchaseStatus, getSubscriptionPackages, purchaseSubscription } from "@/lib/pos-api";
import type { MySubscription, PackageCode, SubscriptionPackage, SubscriptionPurchase } from "@/lib/pos-types";
import { colors } from "@/lib/theme";

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

export default function SubscriptionScreen() {
  const { user } = useSession();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MySubscription | null>(null);
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchase, setPurchase] = useState<SubscriptionPurchase | null>(null);
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

  async function handleSubscribe() {
    if (!selectedId) return;
    setPurchasing(true);
    const result = await purchaseSubscription(selectedId);
    setPurchasing(false);
    if (!result.success) {
      toast.danger(result.error);
      return;
    }
    setPurchase(result.data);

    pollRef.current = setInterval(async () => {
      const statusResult = await getPurchaseStatus(result.data.paymentId);
      if (!statusResult.success) return;
      if (statusResult.data.status === "PAID") {
        if (pollRef.current) clearInterval(pollRef.current);
        setPurchase(null);
        toast.success("ชำระเงินสำเร็จ ต่ออายุแพ็กเกจแล้ว");
        void load();
      } else if (statusResult.data.status === "FAILED") {
        if (pollRef.current) clearInterval(pollRef.current);
        setPurchase(null);
        toast.danger("การชำระเงินไม่สำเร็จ กรุณาลองใหม่");
      }
    }, 3000);
  }

  const selectedPackage = packages.find((p) => p.id === selectedId) ?? null;
  const statusColor = statusColorFor(me?.subscriptionStatus);

  if (purchase) {
    return (
      <View
        className="flex-1 items-center justify-center gap-5 px-6"
        style={{ backgroundColor: colors.bg, paddingTop: insets.top }}
      >
        <Text className="font-serif text-[18px] text-text">สแกน QR เพื่อชำระผ่าน PromptPay</Text>
        <View className="rounded-2xl p-4" style={{ backgroundColor: colors.receiptPaper }}>
          <Image source={{ uri: purchase.qrImageUri }} style={{ width: 240, height: 240 }} resizeMode="contain" />
        </View>
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
            </View>

            <Text className="font-ui-semibold text-[14px] text-text">เลือกแพ็กเกจ</Text>

            {packages.map((pkg) => {
              const isHighlight = pkg.code === "ONE_YEAR";
              const isSelected = selectedId === pkg.id;
              return (
                <Pressable
                  key={pkg.id}
                  onPress={() => setSelectedId(pkg.id)}
                  className="gap-2 rounded-2xl border p-4"
                  style={{
                    borderColor: isSelected ? colors.accent : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    backgroundColor: isHighlight ? colors.accentSoft : colors.card,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="font-ui-semibold text-[15px] text-text">{pkg.name}</Text>
                    <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: colors.raised }}>
                      <Text className="font-ui-medium text-[11px] text-muted2">
                        {PACKAGE_DURATION_LABELS[pkg.code]}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-end gap-2">
                    <Text className="font-ui-bold text-[26px] text-text">฿{pkg.priceThb.toLocaleString("th-TH")}</Text>
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
          </>
        )}
      </ScrollView>

      {!loading && me && (
        <View className="border-t p-4" style={{ borderColor: colors.border }}>
          <Button isLoading={purchasing} isDisabled={!selectedPackage} onPress={handleSubscribe} fullWidth>
            {selectedPackage ? `ชำระเงิน — ฿${selectedPackage.priceThb.toLocaleString("th-TH")}` : "เลือกแพ็กเกจ"}
          </Button>
        </View>
      )}
    </View>
  );
}
