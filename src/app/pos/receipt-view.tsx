"use client";

import { useEffect, useState } from "react";

import { Button } from "@heroui/react";
import { Printer } from "lucide-react";
import { createPortal } from "react-dom";

import type { PaymentMethod } from "./types";

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

export function ReceiptView({
  shopName,
  billId,
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
}: ReceiptViewProps) {
  const createdAtDate = new Date(createdAt);

  // Deliberately fixed cream/paper colors, not theme tokens - this should read as real receipt
  // paper regardless of the app's dark chrome around it.
  const receiptCard = (
    <div className="flex flex-col gap-3 rounded-2xl bg-[#f6f3ee] p-5 font-mono text-[#2a2620] text-sm">
      <div className="flex flex-col items-center gap-0.5 text-center">
        {shopName && <p className="font-heading font-bold text-base">{shopName}</p>}
        <p className="font-semibold">ใบเสร็จรับเงิน</p>
        <p className="text-[#7a7266] text-xs">เลขที่ {billId.slice(-8).toUpperCase()}</p>
        <p className="text-[#7a7266] text-xs">
          {createdAtDate.toLocaleDateString("th-TH")} {createdAtDate.toLocaleTimeString("th-TH")}
        </p>
      </div>

      <div className="border-[#cdc5b8] border-t border-dashed" />

      <div className="flex justify-between text-xs">
        <span className="text-[#7a7266]">ลูกค้า</span>
        <span>{memberName ?? "Walk-in"}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-[#7a7266]">พนักงาน</span>
        <span>{staffName}</span>
      </div>

      <div className="border-[#cdc5b8] border-t border-dashed" />

      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <div key={item.key} className="flex justify-between gap-2">
            <span className="flex-1 truncate">
              {item.name} x{item.quantity}
            </span>
            <span>฿{item.lineTotal.toLocaleString("th-TH")}</span>
          </div>
        ))}
      </div>

      <div className="border-[#cdc5b8] border-t border-dashed" />

      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="text-[#7a7266]">ยอดรวมบริการ</span>
          <span>฿{subtotal.toLocaleString("th-TH")}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-[#7a7266]">ส่วนลด</span>
            <span>-฿{discount.toLocaleString("th-TH")}</span>
          </div>
        )}
        {pointUsed > 0 && (
          <div className="flex justify-between">
            <span className="text-[#7a7266]">ใช้ point ({pointUsed})</span>
            <span>-฿{pointUsedBaht.toLocaleString("th-TH")}</span>
          </div>
        )}
        <div className="flex justify-between border-[#ccc4b6] border-t pt-1 font-bold text-base">
          <span>ยอดชำระ</span>
          <span>฿{total.toLocaleString("th-TH")}</span>
        </div>
        <div className="flex justify-between text-[#7a7266] text-xs">
          <span>ชำระโดย</span>
          <span>{paymentMethod ? (PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod) : "-"}</span>
        </div>
      </div>

      {memberName !== null && (
        <>
          <div className="border-[#cdc5b8] border-t border-dashed" />
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-semibold text-[#8a6d2f]">
              <span>Point ที่ได้รับ</span>
              <span>+{pointEarned}</span>
            </div>
            {pointBalanceAfter !== null && (
              <div className="flex justify-between">
                <span className="text-[#7a7266]">Point คงเหลือ</span>
                <span>{pointBalanceAfter.toLocaleString("th-TH")}</span>
              </div>
            )}
          </div>
        </>
      )}

      <div className="border-[#cdc5b8] border-t border-dashed" />
      <p className="text-center text-[#7a7266] text-xs">ขอบคุณที่ใช้บริการ</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {receiptCard}

      <Button type="button" variant="secondary" size="lg" fullWidth onPress={() => window.print()}>
        <Printer className="size-4" />
        พิมพ์ใบเสร็จ
      </Button>

      {/* Printed as a portal straight onto <body>, not in place - the Modal this normally renders
          inside applies a CSS transform for its open/close animation, which makes it the containing
          block for any position:absolute/fixed descendant, so the receipt printed at the modal's
          on-screen position instead of the top of the physical page. Portaling escapes that. */}
      <PrintPortal>{receiptCard}</PrintPortal>
    </div>
  );
}

function PrintPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<div className="print-receipt hidden">{children}</div>, document.body);
}
