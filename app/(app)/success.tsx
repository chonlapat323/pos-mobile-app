import { ScrollView, Text, View } from "react-native";

import { router } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReceiptView } from "@/components/pos/receipt-view";
import { Button } from "@/components/ui/button";
import { usePosCart } from "@/contexts/pos-cart";
import { useSession } from "@/contexts/session";
import { colors } from "@/lib/theme";

export default function SuccessScreen() {
  const { user } = useSession();
  const { state, dispatch } = usePosCart();
  const insets = useSafeAreaInsets();
  const { lastBill: bill, member, cart, pointsUsed, shop } = state;
  const bahtPerPoint = shop?.bahtPerPoint ?? 50;

  function newTransaction() {
    dispatch({ type: "RESET" });
    router.back();
  }

  if (!bill) {
    return (
      <View
        className="flex-1 items-center justify-center gap-4"
        style={{ backgroundColor: colors.bg, paddingTop: insets.top }}
      >
        <Text className="font-ui text-muted">ไม่พบข้อมูลบิล</Text>
        <Button onPress={newTransaction}>เริ่มรายการใหม่</Button>
      </View>
    );
  }

  const newBalance = member ? member.pointBalance - pointsUsed + bill.pointEarned : null;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.bg, paddingTop: insets.top }}
      contentContainerClassName="gap-4 p-5"
    >
      <View className="items-center gap-3">
        <View
          className="h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.successSoft }}
        >
          <CheckCircle2 size={28} color={colors.success} />
        </View>
        <Text className="font-serif text-[19px] text-text">ชำระเงินสำเร็จ</Text>
      </View>

      <ReceiptView
        shopName={shop?.name ?? ""}
        billId={bill.id}
        createdAt={bill.createdAt}
        memberName={member ? member.name : null}
        staffName={user?.name ?? ""}
        items={cart.map((line) => ({
          key: line.serviceId,
          name: line.name,
          quantity: line.quantity,
          lineTotal: line.price * line.quantity,
        }))}
        subtotal={cart.reduce((sum, line) => sum + line.price * line.quantity, 0)}
        discount={Number(bill.discount)}
        pointUsed={bill.pointUsed}
        pointUsedBaht={bill.pointUsed * bahtPerPoint}
        total={Number(bill.total)}
        paymentMethod={bill.paymentMethod}
        pointEarned={bill.pointEarned}
        pointBalanceAfter={newBalance}
      />

      <Button fullWidth onPress={newTransaction}>
        เริ่มรายการใหม่
      </Button>
    </ScrollView>
  );
}
