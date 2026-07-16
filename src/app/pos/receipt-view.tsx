"use client";

import { Button } from "@heroui/react";
import { Printer } from "lucide-react";

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

  return (
    <div className="flex flex-col gap-3">
      <div className="print-receipt flex flex-col gap-3 rounded-lg border border-border p-4 font-mono text-sm">
        <div className="flex flex-col items-center gap-0.5 text-center">
          {shopName && <p className="font-semibold text-base">{shopName}</p>}
          <p className="font-semibold">ใบเสร็จรับเงิน</p>
          <p className="text-muted text-xs">เลขที่ {billId.slice(-8).toUpperCase()}</p>
          <p className="text-muted text-xs">
            {createdAtDate.toLocaleDateString("th-TH")} {createdAtDate.toLocaleTimeString("th-TH")}
          </p>
        </div>

        <div className="border-border border-t border-dashed" />

        <div className="flex justify-between text-xs">
          <span className="text-muted">ลูกค้า</span>
          <span>{memberName ?? "Walk-in"}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted">พนักงาน</span>
          <span>{staffName}</span>
        </div>

        <div className="border-border border-t border-dashed" />

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

        <div className="border-border border-t border-dashed" />

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-muted">ยอดรวมบริการ</span>
            <span>฿{subtotal.toLocaleString("th-TH")}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">ส่วนลด</span>
              <span>-฿{discount.toLocaleString("th-TH")}</span>
            </div>
          )}
          {pointUsed > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">ใช้ point ({pointUsed})</span>
              <span>-฿{pointUsedBaht.toLocaleString("th-TH")}</span>
            </div>
          )}
          <div className="flex justify-between border-border border-t pt-1 font-semibold text-base">
            <span>ยอดชำระ</span>
            <span>฿{total.toLocaleString("th-TH")}</span>
          </div>
          <div className="flex justify-between text-muted text-xs">
            <span>ชำระโดย</span>
            <span>{paymentMethod ? (PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod) : "-"}</span>
          </div>
        </div>

        {memberName !== null && (
          <>
            <div className="border-border border-t border-dashed" />
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-medium text-accent">
                <span>Point ที่ได้รับ</span>
                <span>+{pointEarned}</span>
              </div>
              {pointBalanceAfter !== null && (
                <div className="flex justify-between">
                  <span className="text-muted">Point คงเหลือ</span>
                  <span>{pointBalanceAfter.toLocaleString("th-TH")}</span>
                </div>
              )}
            </div>
          </>
        )}

        <div className="border-border border-t border-dashed" />
        <p className="text-center text-muted text-xs">ขอบคุณที่ใช้บริการ</p>
      </div>

      <Button type="button" variant="secondary" size="lg" onPress={() => window.print()}>
        <Printer className="size-4" />
        พิมพ์ใบเสร็จ
      </Button>
    </div>
  );
}
