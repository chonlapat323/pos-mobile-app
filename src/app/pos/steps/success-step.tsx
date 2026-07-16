"use client";

import { Button } from "@heroui/react";
import { CheckCircle2 } from "lucide-react";

import { ReceiptView } from "../receipt-view";
import type { Bill, CartLine, Member } from "../types";

interface SuccessStepProps {
  bill: Bill | null;
  member: Member | null;
  cart: CartLine[];
  pointsUsed: number;
  bahtPerPoint: number;
  shopName: string;
  staffName: string;
  onNewTransaction: () => void;
}

export function SuccessStep({
  bill,
  member,
  cart,
  pointsUsed,
  bahtPerPoint,
  shopName,
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

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-success-soft">
          <CheckCircle2 className="size-7 text-success" />
        </div>
        <p className="font-heading font-semibold text-xl">ชำระเงินสำเร็จ</p>
      </div>

      <ReceiptView
        shopName={shopName}
        billId={bill.id}
        createdAt={bill.createdAt}
        memberName={member ? member.name : null}
        staffName={staffName}
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

      <Button type="button" size="lg" fullWidth onPress={onNewTransaction}>
        เริ่มรายการใหม่
      </Button>
    </div>
  );
}
