import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReceiptView } from "@/components/pos/receipt-view";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { usePosCart } from "@/contexts/pos-cart";
import { getBills } from "@/lib/pos-api";
import type { BillHistoryItem } from "@/lib/pos-types";
import { colors } from "@/lib/theme";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "เงินสด",
  TRANSFER: "โอน",
  CARD: "บัตร",
};

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function HistoryScreen() {
  const { state } = usePosCart();
  const insets = useSafeAreaInsets();
  const bahtPerPoint = state.shop?.bahtPerPoint ?? 50;

  const [dateFrom, setDateFrom] = useState(todayString());
  const [dateTo, setDateTo] = useState(todayString());
  const [search, setSearch] = useState("");
  const [bills, setBills] = useState<BillHistoryItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<BillHistoryItem | null>(null);

  async function loadBills() {
    setLoading(true);
    const result = await getBills({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      search: search.trim() || undefined,
    });
    setLoading(false);
    if (!result.success) {
      toast.danger(result.error);
      return;
    }
    setBills(result.data.data);
    setTotal(result.data.total);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: only load once on mount, subsequent loads are explicit via the "ค้นหา" button
  useEffect(() => {
    void loadBills();
  }, []);

  if (selected) {
    const createdAtDate = new Date(selected.createdAt);
    return (
      <View className="flex-1" style={{ backgroundColor: colors.bg, paddingTop: insets.top }}>
        <ScrollView className="flex-1 px-4" contentContainerClassName="gap-4 py-4">
          <Button variant="secondary" onPress={() => setSelected(null)}>
            กลับไปที่รายการ
          </Button>
          <ReceiptView
            shopName={state.shop?.name ?? ""}
            billId={selected.id}
            createdAt={selected.createdAt}
            memberName={selected.member?.name ?? null}
            staffName={selected.staff.name}
            items={selected.items.map((item) => ({
              key: item.id,
              name: item.service.name,
              quantity: item.quantity,
              lineTotal: Number(item.priceAtSale) * item.quantity,
            }))}
            subtotal={Number(selected.subtotal)}
            discount={Number(selected.discount)}
            pointUsed={selected.pointUsed}
            pointUsedBaht={selected.pointUsed * bahtPerPoint}
            total={Number(selected.total)}
            paymentMethod={selected.paymentMethod}
            pointEarned={selected.pointEarned}
            pointBalanceAfter={null}
          />
          <Text className="text-center text-[11px] text-muted">{createdAtDate.toLocaleString("th-TH")}</Text>
        </ScrollView>
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
        <Text className="font-serif text-[17px] text-text">ประวัติการขาย</Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerClassName="gap-3 py-4">
        <View className="flex-row gap-3">
          <View className="flex-1 gap-1.5">
            <Text className="font-ui-medium text-[12px] text-text-soft">ตั้งแต่วันที่</Text>
            <TextInput
              value={dateFrom}
              onChangeText={setDateFrom}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.faint}
              className="rounded-lg border px-3 py-2.5 font-ui text-[13px] text-text"
              style={{ borderColor: colors.borderMid, backgroundColor: colors.inputBg }}
            />
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="font-ui-medium text-[12px] text-text-soft">ถึงวันที่</Text>
            <TextInput
              value={dateTo}
              onChangeText={setDateTo}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.faint}
              className="rounded-lg border px-3 py-2.5 font-ui text-[13px] text-text"
              style={{ borderColor: colors.borderMid, backgroundColor: colors.inputBg }}
            />
          </View>
        </View>
        <View className="gap-1.5">
          <Text className="font-ui-medium text-[12px] text-text-soft">ค้นหา (ชื่อ/เบอร์โทรลูกค้า หรือชื่อพนักงาน)</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="พิมพ์เพื่อค้นหา"
            placeholderTextColor={colors.faint}
            className="rounded-lg border px-3 py-2.5 font-ui text-[13px] text-text"
            style={{ borderColor: colors.borderMid, backgroundColor: colors.inputBg }}
          />
        </View>
        <Button isLoading={loading} onPress={loadBills}>
          {loading ? "กำลังค้นหา..." : "ค้นหา"}
        </Button>

        <View className="gap-2">
          {(() => {
            if (bills === null || loading) {
              return <Text className="font-ui text-[13px] text-muted">กำลังโหลด...</Text>;
            }
            if (bills.length === 0) {
              return <Text className="font-ui text-[13px] text-muted">ไม่พบรายการ</Text>;
            }
            return (
              <>
                <Text className="text-[11px] text-muted">พบ {total.toLocaleString("th-TH")} รายการ</Text>
                {bills.map((bill) => {
                  const createdAtDate = new Date(bill.createdAt);
                  return (
                    <Pressable
                      key={bill.id}
                      onPress={() => setSelected(bill)}
                      className="flex-row items-center justify-between gap-3 rounded-xl border p-3"
                      style={{ borderColor: colors.border, backgroundColor: colors.cardAlt }}
                    >
                      <View className="min-w-0 flex-1">
                        <Text className="font-ui-medium text-[13px] text-text" numberOfLines={1}>
                          {bill.member ? bill.member.name : "Walk-in"}
                        </Text>
                        <Text className="text-[11px] text-muted2">
                          {createdAtDate.toLocaleDateString("th-TH")} {createdAtDate.toLocaleTimeString("th-TH")} ·{" "}
                          {bill.staff.name}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="font-ui-semibold text-[13px] text-text">
                          ฿{Number(bill.total).toLocaleString("th-TH")}
                        </Text>
                        <Text className="text-[11px] text-muted2">
                          {bill.paymentMethod ? (PAYMENT_METHOD_LABELS[bill.paymentMethod] ?? bill.paymentMethod) : "-"}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </>
            );
          })()}
        </View>
      </ScrollView>
    </View>
  );
}
