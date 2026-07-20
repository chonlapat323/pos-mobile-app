import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { toast } from "@/components/ui/toast";
import { useSession } from "@/contexts/session";
import { getSubscriptionHistory } from "@/lib/pos-api";
import type { SubscriptionHistoryEntry } from "@/lib/pos-types";
import { colors } from "@/lib/theme";

const STATUS_LABELS: Record<SubscriptionHistoryEntry["status"], string> = {
  PENDING: "รอชำระเงิน",
  TRIALING: "ทดลองใช้ฟรี",
  ACTIVE: "ใช้งานอยู่",
  EXPIRED: "หมดอายุแล้ว",
  CANCELLED: "ยกเลิกแล้ว",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "รอชำระเงิน",
  PAID: "ชำระแล้ว",
  FAILED: "ไม่สำเร็จ",
};

function statusColorFor(status: SubscriptionHistoryEntry["status"]) {
  if (status === "EXPIRED" || status === "CANCELLED") return colors.danger;
  if (status === "ACTIVE") return colors.success;
  return colors.accent;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}

export default function SubscriptionHistoryScreen() {
  const { user } = useSession();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<SubscriptionHistoryEntry[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getSubscriptionHistory();
    setLoading(false);
    if (!result.success) {
      toast.danger(result.error);
      return;
    }
    setEntries(result.data);
  }, []);

  useEffect(() => {
    if (user && user.role !== "OWNER") {
      router.back();
      return;
    }
    void load();
  }, [user, load]);

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
        <Text className="font-serif text-[17px] text-text">ประวัติการชำระเงิน</Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerClassName="gap-3 py-4">
        {(() => {
          if (loading) {
            return <Text className="font-ui text-[13px] text-muted">กำลังโหลด...</Text>;
          }
          if (entries.length === 0) {
            return <Text className="font-ui text-[13px] text-muted">ยังไม่มีประวัติการชำระเงิน</Text>;
          }
          return entries.map((entry) => {
            const payment = entry.payments[0];
            return (
              <View
                key={entry.id}
                className="gap-2 rounded-xl border p-3"
                style={{ borderColor: colors.border, backgroundColor: colors.cardAlt }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="font-ui-medium text-[13px] text-text">{entry.package.name}</Text>
                  <Text className="font-ui-semibold text-[12px]" style={{ color: statusColorFor(entry.status) }}>
                    {STATUS_LABELS[entry.status]}
                  </Text>
                </View>
                <Text className="text-[11px] text-muted2">
                  {formatDate(entry.startAt)} — {formatDate(entry.endAt)}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-[11px] text-muted2">
                    {payment ? (PAYMENT_STATUS_LABELS[payment.status] ?? payment.status) : "ไม่มีการชำระเงิน (ทดลองใช้ฟรี)"}
                  </Text>
                  {payment && (
                    <Text className="font-ui-semibold text-[13px] text-text">
                      ฿{payment.amountThb.toLocaleString("th-TH")}
                    </Text>
                  )}
                </View>
              </View>
            );
          });
        })()}
      </ScrollView>
    </View>
  );
}
