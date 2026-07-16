"use client";

import { Button } from "@heroui/react";
import { CheckCircle2 } from "lucide-react";

import type { Bill, CartLine, Member } from "../types";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "เงินสด",
  TRANSFER: "โอน",
  CARD: "บัตร",
};

interface SuccessStepProps {
  bill: Bill | null;
  member: Member | null;
  cart: CartLine[];
  pointsUsed: number;
  bahtPerPoint: number;
  staffName: string;
  onNewTransaction: () => void;
}

export function SuccessStep({
  bill,
  member,
  cart,
  pointsUsed,
  bahtPerPoint,
  staffName,
  onNewTransaction,
}: SuccessStepProps) {
  if (!bill) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-muted">ไม่พบข้อมูลบิล</p>
        <Button type="button" onPress={onNewTransaction}>
          เริ่มรายการใหม่
        </Button>
      </div>
    );
  }

  const newBalance = member ? member.pointBalance - pointsUsed + bill.pointEarned : null;
  const createdAt = new Date(bill.createdAt);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <CheckCircle2 className="size-12 text-success" />
        <p className="font-semibold text-xl">ชำระเงินสำเร็จ</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border p-4 font-mono text-sm">
        <div className="flex flex-col items-center gap-0.5 text-center">
          <p className="font-semibold">ใบเสร็จรับเงิน</p>
          <p className="text-muted text-xs">เลขที่ {bill.id.slice(-8).toUpperCase()}</p>
          <p className="text-muted text-xs">
            {createdAt.toLocaleDateString("th-TH")} {createdAt.toLocaleTimeString("th-TH")}
          </p>
        </div>

        <div className="border-border border-t border-dashed" />

        <div className="flex justify-between text-xs">
          <span className="text-muted">ลูกค้า</span>
          <span>{member ? member.name : "Walk-in"}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted">พนักงาน</span>
          <span>{staffName}</span>
        </div>

        <div className="border-border border-t border-dashed" />

        <div className="flex flex-col gap-1">
          {cart.map((line) => (
            <div key={line.serviceId} className="flex justify-between gap-2">
              <span className="flex-1 truncate">
                {line.name} x{line.quantity}
              </span>
              <span>฿{(line.price * line.quantity).toLocaleString("th-TH")}</span>
            </div>
          ))}
        </div>

        <div className="border-border border-t border-dashed" />

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-muted">ยอดรวมบริการ</span>
            <span>฿{Number(bill.subtotal).toLocaleString("th-TH")}</span>
          </div>
          {Number(bill.discount) > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">ส่วนลด</span>
              <span>-฿{Number(bill.discount).toLocaleString("th-TH")}</span>
            </div>
          )}
          {bill.pointUsed > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">ใช้ point ({bill.pointUsed})</span>
              <span>-฿{(bill.pointUsed * bahtPerPoint).toLocaleString("th-TH")}</span>
            </div>
          )}
          <div className="flex justify-between border-border border-t pt-1 font-semibold text-base">
            <span>ยอดชำระ</span>
            <span>฿{Number(bill.total).toLocaleString("th-TH")}</span>
          </div>
          <div className="flex justify-between text-muted text-xs">
            <span>ชำระโดย</span>
            <span>{bill.paymentMethod ? (PAYMENT_METHOD_LABELS[bill.paymentMethod] ?? bill.paymentMethod) : "-"}</span>
          </div>
        </div>

        {member && (
          <>
            <div className="border-border border-t border-dashed" />
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-medium text-accent">
                <span>Point ที่ได้รับ</span>
                <span>+{bill.pointEarned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Point คงเหลือ</span>
                <span>{newBalance?.toLocaleString("th-TH")}</span>
              </div>
            </div>
          </>
        )}

        <div className="border-border border-t border-dashed" />
        <p className="text-center text-muted text-xs">ขอบคุณที่ใช้บริการ</p>
      </div>

      <Button type="button" size="lg" fullWidth onPress={onNewTransaction}>
        เริ่มรายการใหม่
      </Button>
    </div>
  );
}
