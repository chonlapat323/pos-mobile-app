"use client";

import { useState } from "react";

import { Button, Input, Label, TextField, toast } from "@heroui/react";

import { createBill } from "../actions";
import type { Bill, CartLine, Member, PaymentMethod } from "../types";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "เงินสด" },
  { value: "TRANSFER", label: "โอน" },
  { value: "CARD", label: "บัตร" },
];

interface PaymentStepProps {
  member: Member | null;
  cart: CartLine[];
  discount: number;
  pointsUsed: number;
  paymentMethod: PaymentMethod | null;
  bahtPerPoint: number;
  onSetDiscount: (value: number) => void;
  onSetPointsUsed: (value: number) => void;
  onSetPaymentMethod: (method: PaymentMethod) => void;
  onBack: () => void;
  onSelectMember: () => void;
  onBounceToMember: () => void;
  onSuccess: (bill: Bill) => void;
}

export function PaymentStep({
  member,
  cart,
  discount,
  pointsUsed,
  paymentMethod,
  bahtPerPoint,
  onSetDiscount,
  onSetPointsUsed,
  onSetPaymentMethod,
  onBack,
  onSelectMember,
  onBounceToMember,
  onSuccess,
}: PaymentStepProps) {
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const pointsDiscountBaht = pointsUsed * bahtPerPoint;
  const total = Math.max(0, subtotal - discount - pointsDiscountBaht);
  const pointsEarnedPreview = member ? Math.floor(total / bahtPerPoint) : 0;
  const maxPointsUsable = member?.pointBalance ?? 0;

  async function handleSubmit() {
    if (!paymentMethod) {
      toast.danger("กรุณาเลือกช่องทางชำระเงิน");
      return;
    }
    setSubmitting(true);
    const result = await createBill({
      memberId: member?.id,
      items: cart.map(({ serviceId, quantity }) => ({ serviceId, quantity })),
      discount: discount || undefined,
      pointsUsed: pointsUsed || undefined,
      paymentMethod,
    });
    setSubmitting(false);

    if (!result.success) {
      if (result.error.includes("Member not found")) {
        toast.danger("ไม่พบสมาชิกนี้แล้ว กรุณาเลือกสมาชิกใหม่");
        onBounceToMember();
        return;
      }
      if (result.error.includes("does not belong to this shop")) {
        toast.danger("มีบริการที่ใช้ไม่ได้แล้วในตะกร้า กรุณาตรวจสอบรายการอีกครั้ง");
        onBack();
        return;
      }
      toast.danger(result.error);
      return;
    }

    onSuccess(result.data);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>ช่องทางชำระเงิน</Label>
        <div className="flex gap-2">
          {PAYMENT_METHODS.map((method) => (
            <Button
              key={method.value}
              type="button"
              variant={paymentMethod === method.value ? "primary" : "secondary"}
              fullWidth
              onPress={() => onSetPaymentMethod(method.value)}
            >
              {method.label}
            </Button>
          ))}
        </div>
      </div>

      <TextField
        value={discount === 0 ? "" : String(discount)}
        onChange={(value) => onSetDiscount(Number(value) || 0)}
        fullWidth
      >
        <Label>ส่วนลด (บาท)</Label>
        <Input type="number" min={0} placeholder="0" />
      </TextField>

      {member ? (
        <TextField
          value={pointsUsed === 0 ? "" : String(pointsUsed)}
          onChange={(value) => onSetPointsUsed(Math.max(0, Math.min(maxPointsUsable, Number(value) || 0)))}
          fullWidth
        >
          <Label>ใช้ point แทนส่วนลด (มี {member.pointBalance.toLocaleString("th-TH")} point)</Label>
          <Input type="number" min={0} max={maxPointsUsable} placeholder="0" />
        </TextField>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border border-dashed p-3">
          <p className="text-muted text-sm">ไม่ได้ระบุลูกค้า — จะไม่ได้สะสม point</p>
          <Button type="button" variant="secondary" size="sm" onPress={onSelectMember}>
            ระบุลูกค้า
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-1 rounded-lg border border-border p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted">ยอดรวมบริการ</span>
          <span>฿{subtotal.toLocaleString("th-TH")}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">ส่วนลด</span>
            <span>-฿{discount.toLocaleString("th-TH")}</span>
          </div>
        )}
        {pointsUsed > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">ใช้ point ({pointsUsed})</span>
            <span>-฿{pointsDiscountBaht.toLocaleString("th-TH")}</span>
          </div>
        )}
        <div className="flex justify-between border-border border-t pt-1 font-medium text-lg">
          <span>ยอดชำระ</span>
          <span>฿{total.toLocaleString("th-TH")}</span>
        </div>
        {member && <p className="font-medium text-accent text-sm">จะได้รับ {pointsEarnedPreview} point</p>}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <Button type="button" variant="secondary" onPress={onBack}>
          ย้อนกลับ
        </Button>
        <Button type="button" onPress={handleSubmit} isDisabled={submitting}>
          {submitting ? "กำลังบันทึก..." : "ยืนยันการชำระเงิน"}
        </Button>
      </div>
    </div>
  );
}
