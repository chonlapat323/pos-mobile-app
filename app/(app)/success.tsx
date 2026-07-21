import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Camera, CheckCircle2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReceiptView } from "@/components/pos/receipt-view";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { usePosCart } from "@/contexts/pos-cart";
import { useSession } from "@/contexts/session";
import { createVisitPhoto, uploadImage } from "@/lib/pos-api";
import type { PhotoType } from "@/lib/pos-types";
import { colors } from "@/lib/theme";

const PHOTO_TYPE_LABELS: Record<PhotoType, string> = { BEFORE: "ถ่ายรูปก่อน", AFTER: "ถ่ายรูปหลัง" };

function VisitPhotoButton({ type, memberId, billId }: { type: PhotoType; memberId: string; billId: string }) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");

  async function capture() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      toast.danger("กรุณาอนุญาตให้แอปเข้าถึงกล้องก่อน");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.6 });
    if (result.canceled || !result.assets[0]) return;

    setStatus("uploading");
    const uploaded = await uploadImage(result.assets[0].uri);
    if (!uploaded.success) {
      toast.danger(uploaded.error);
      setStatus("idle");
      return;
    }

    const photo = await createVisitPhoto({ memberId, type, imageUrl: uploaded.data.url, billId });
    if (!photo.success) {
      toast.danger(photo.error);
      setStatus("idle");
      return;
    }

    setStatus("done");
    toast.success(`บันทึกรูป${type === "BEFORE" ? "ก่อน" : "หลัง"}แล้ว`);
  }

  return (
    <Pressable
      onPress={capture}
      disabled={status === "uploading"}
      className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border py-3"
      style={{
        borderColor: colors.borderMid,
        backgroundColor: status === "done" ? colors.successSoft : colors.raised,
        opacity: status === "uploading" ? 0.6 : 1,
      }}
    >
      {status === "uploading" ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Camera size={16} color={status === "done" ? colors.success : colors.text} />
      )}
      <Text className="font-ui-medium text-[13px]" style={{ color: status === "done" ? colors.success : colors.text }}>
        {status === "done" ? "บันทึกแล้ว" : PHOTO_TYPE_LABELS[type]}
      </Text>
    </Pressable>
  );
}

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

      {member && (
        <View className="gap-2">
          <Text className="font-ui-medium text-[13px] text-muted2">แนบรูปก่อน-หลัง (ถ้ามี)</Text>
          <View className="flex-row gap-2">
            <VisitPhotoButton type="BEFORE" memberId={member.id} billId={bill.id} />
            <VisitPhotoButton type="AFTER" memberId={member.id} billId={bill.id} />
          </View>
        </View>
      )}

      <Button fullWidth onPress={newTransaction}>
        เริ่มรายการใหม่
      </Button>
    </ScrollView>
  );
}
