import { useState } from "react";
import { Text, View } from "react-native";

import * as Print from "expo-print";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { PaymentMethod } from "@/lib/pos-types";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "เงินสด",
  TRANSFER: "โอน",
  CARD: "บัตร",
};

export interface ReceiptLineItem {
  key: string;
  name: string;
  quantity: number;
  lineTotal: number;
}

interface ReceiptViewProps {
  shopName: string;
  billId: string;
  createdAt: string;
  memberName: string | null;
  staffName: string;
  items: ReceiptLineItem[];
  subtotal: number;
  discount: number;
  pointUsed: number;
  pointUsedBaht: number;
  total: number;
  paymentMethod: PaymentMethod | null;
  pointEarned: number;
  /** Points remaining after this bill - pass null when it isn't known/meaningful (e.g. reprinting an old bill). */
  pointBalanceAfter: number | null;
}

function buildReceiptHtml(props: ReceiptViewProps) {
  const createdAtDate = new Date(props.createdAt);
  const itemsHtml = props.items
    .map(
      (item) =>
        `<div style="display:flex;justify-content:space-between;gap:8px"><span>${item.name} x${item.quantity}</span><span>฿${item.lineTotal.toLocaleString("th-TH")}</span></div>`,
    )
    .join("");

  return `
    <html>
      <head>
        <style>
          /* Two explicit lengths, not "80mm auto" - a page size mixing a fixed length with the
             auto keyword is invalid CSS and gets silently dropped, falling back to a full
             Letter/A4 page (the exact bug this was fixed for once already, in the old web app). */
          @page { size: 80mm 200mm; margin: 0; }
          * { box-sizing: border-box; }
          body { margin: 0; }
        </style>
      </head>
      <body style="font-family:monospace;color:#2a2620;background:#f6f3ee;padding:16px;width:80mm">
        <div style="text-align:center">
          ${props.shopName ? `<p style="font-weight:bold;margin:0">${props.shopName}</p>` : ""}
          <p style="font-weight:600;margin:4px 0 0">ใบเสร็จรับเงิน</p>
          <p style="color:#7a7266;font-size:12px;margin:2px 0">เลขที่ ${props.billId.slice(-8).toUpperCase()}</p>
          <p style="color:#7a7266;font-size:12px;margin:0">${createdAtDate.toLocaleDateString("th-TH")} ${createdAtDate.toLocaleTimeString("th-TH")}</p>
        </div>
        <hr style="border-top:1px dashed #cdc5b8;margin:12px 0" />
        <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:#7a7266">ลูกค้า</span><span>${props.memberName ?? "Walk-in"}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:#7a7266">พนักงาน</span><span>${props.staffName}</span></div>
        <hr style="border-top:1px dashed #cdc5b8;margin:12px 0" />
        ${itemsHtml}
        <hr style="border-top:1px dashed #cdc5b8;margin:12px 0" />
        <div style="display:flex;justify-content:space-between"><span style="color:#7a7266">ยอดรวมบริการ</span><span>฿${props.subtotal.toLocaleString("th-TH")}</span></div>
        ${props.discount > 0 ? `<div style="display:flex;justify-content:space-between"><span style="color:#7a7266">ส่วนลด</span><span>-฿${props.discount.toLocaleString("th-TH")}</span></div>` : ""}
        ${props.pointUsed > 0 ? `<div style="display:flex;justify-content:space-between"><span style="color:#7a7266">ใช้ point (${props.pointUsed})</span><span>-฿${props.pointUsedBaht.toLocaleString("th-TH")}</span></div>` : ""}
        <div style="display:flex;justify-content:space-between;border-top:1px solid #ccc4b6;padding-top:6px;font-weight:bold;font-size:16px"><span>ยอดชำระ</span><span>฿${props.total.toLocaleString("th-TH")}</span></div>
        <div style="display:flex;justify-content:space-between;color:#7a7266;font-size:12px"><span>ชำระโดย</span><span>${props.paymentMethod ? (PAYMENT_METHOD_LABELS[props.paymentMethod] ?? props.paymentMethod) : "-"}</span></div>
        ${
          props.memberName !== null
            ? `<hr style="border-top:1px dashed #cdc5b8;margin:12px 0" />
               <div style="display:flex;justify-content:space-between;font-weight:600;color:#8a6d2f"><span>Point ที่ได้รับ</span><span>+${props.pointEarned}</span></div>
               ${props.pointBalanceAfter !== null ? `<div style="display:flex;justify-content:space-between"><span style="color:#7a7266">Point คงเหลือ</span><span>${props.pointBalanceAfter.toLocaleString("th-TH")}</span></div>` : ""}`
            : ""
        }
        <hr style="border-top:1px dashed #cdc5b8;margin:12px 0" />
        <p style="text-align:center;color:#7a7266;font-size:12px">ขอบคุณที่ใช้บริการ</p>
      </body>
    </html>
  `;
}

export function ReceiptView(props: ReceiptViewProps) {
  const [printing, setPrinting] = useState(false);
  const {
    createdAt,
    memberName,
    staffName,
    items,
    subtotal,
    discount,
    pointUsed,
    pointUsedBaht,
    total,
    paymentMethod,
    pointEarned,
    pointBalanceAfter,
    billId,
  } = props;
  const createdAtDate = new Date(createdAt);

  async function handlePrint() {
    setPrinting(true);
    try {
      await Print.printAsync({ html: buildReceiptHtml(props) });
    } catch {
      toast.danger("พิมพ์ใบเสร็จไม่สำเร็จ");
    } finally {
      setPrinting(false);
    }
  }

  return (
    <View className="gap-3">
      {/* Deliberately fixed cream/paper colors, not theme tokens - this should read as real receipt
          paper regardless of the app's dark chrome around it. */}
      <View className="gap-3 rounded-2xl p-5" style={{ backgroundColor: "#f6f3ee" }}>
        <View className="items-center gap-0.5">
          {props.shopName && (
            <Text className="font-bold font-serif text-[15px]" style={{ color: "#2a2620" }}>
              {props.shopName}
            </Text>
          )}
          <Text className="font-ui-semibold text-[13px]" style={{ color: "#2a2620" }}>
            ใบเสร็จรับเงิน
          </Text>
          <Text className="text-[11px]" style={{ color: "#7a7266" }}>
            เลขที่ {billId.slice(-8).toUpperCase()}
          </Text>
          <Text className="text-[11px]" style={{ color: "#7a7266" }}>
            {createdAtDate.toLocaleDateString("th-TH")} {createdAtDate.toLocaleTimeString("th-TH")}
          </Text>
        </View>

        <View style={{ borderTopWidth: 1, borderStyle: "dashed", borderColor: "#cdc5b8" }} />

        <View className="flex-row justify-between">
          <Text className="text-[12px]" style={{ color: "#7a7266" }}>
            ลูกค้า
          </Text>
          <Text className="text-[12px]" style={{ color: "#2a2620" }}>
            {memberName ?? "Walk-in"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-[12px]" style={{ color: "#7a7266" }}>
            พนักงาน
          </Text>
          <Text className="text-[12px]" style={{ color: "#2a2620" }}>
            {staffName}
          </Text>
        </View>

        <View style={{ borderTopWidth: 1, borderStyle: "dashed", borderColor: "#cdc5b8" }} />

        <View className="gap-1">
          {items.map((item) => (
            <View key={item.key} className="flex-row justify-between gap-2">
              <Text className="flex-1" numberOfLines={1} style={{ color: "#2a2620" }}>
                {item.name} x{item.quantity}
              </Text>
              <Text style={{ color: "#2a2620" }}>฿{item.lineTotal.toLocaleString("th-TH")}</Text>
            </View>
          ))}
        </View>

        <View style={{ borderTopWidth: 1, borderStyle: "dashed", borderColor: "#cdc5b8" }} />

        <View className="gap-1">
          <View className="flex-row justify-between">
            <Text className="text-[13px]" style={{ color: "#7a7266" }}>
              ยอดรวมบริการ
            </Text>
            <Text className="text-[13px]" style={{ color: "#2a2620" }}>
              ฿{subtotal.toLocaleString("th-TH")}
            </Text>
          </View>
          {discount > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-[13px]" style={{ color: "#7a7266" }}>
                ส่วนลด
              </Text>
              <Text className="text-[13px]" style={{ color: "#2a2620" }}>
                -฿{discount.toLocaleString("th-TH")}
              </Text>
            </View>
          )}
          {pointUsed > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-[13px]" style={{ color: "#7a7266" }}>
                ใช้ point ({pointUsed})
              </Text>
              <Text className="text-[13px]" style={{ color: "#2a2620" }}>
                -฿{pointUsedBaht.toLocaleString("th-TH")}
              </Text>
            </View>
          )}
          <View className="flex-row justify-between border-t pt-1" style={{ borderColor: "#ccc4b6" }}>
            <Text className="font-bold text-[15px]" style={{ color: "#2a2620" }}>
              ยอดชำระ
            </Text>
            <Text className="font-bold text-[15px]" style={{ color: "#2a2620" }}>
              ฿{total.toLocaleString("th-TH")}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[11px]" style={{ color: "#7a7266" }}>
              ชำระโดย
            </Text>
            <Text className="text-[11px]" style={{ color: "#7a7266" }}>
              {paymentMethod ? (PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod) : "-"}
            </Text>
          </View>
        </View>

        {memberName !== null && (
          <>
            <View style={{ borderTopWidth: 1, borderStyle: "dashed", borderColor: "#cdc5b8" }} />
            <View className="gap-1">
              <View className="flex-row justify-between">
                <Text className="font-ui-semibold text-[13px]" style={{ color: "#8a6d2f" }}>
                  Point ที่ได้รับ
                </Text>
                <Text className="font-ui-semibold text-[13px]" style={{ color: "#8a6d2f" }}>
                  +{pointEarned}
                </Text>
              </View>
              {pointBalanceAfter !== null && (
                <View className="flex-row justify-between">
                  <Text className="text-[13px]" style={{ color: "#7a7266" }}>
                    Point คงเหลือ
                  </Text>
                  <Text className="text-[13px]" style={{ color: "#2a2620" }}>
                    {pointBalanceAfter.toLocaleString("th-TH")}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={{ borderTopWidth: 1, borderStyle: "dashed", borderColor: "#cdc5b8" }} />
        <Text className="text-center text-[11px]" style={{ color: "#7a7266" }}>
          ขอบคุณที่ใช้บริการ
        </Text>
      </View>

      <Button variant="secondary" fullWidth isLoading={printing} onPress={handlePrint}>
        พิมพ์ใบเสร็จ
      </Button>
    </View>
  );
}
