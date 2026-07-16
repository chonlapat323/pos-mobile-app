"use client";

import { useState } from "react";

import { Button, Input, Label, TextField, toast } from "@heroui/react";
import { Banknote, Repeat, ShoppingBag, User } from "lucide-react";

import { cn } from "@/lib/utils";

import { createBill } from "../actions";
import type { Bill, CartLine, Member, PaymentMethod } from "../types";
import { CartLineItem } from "./cart-line-item";

// CARD is a valid PaymentMethod on the backend but not offered here yet - add back to this list when ready.
const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: "CASH", label: "เงินสด", icon: Banknote },
  { value: "TRANSFER", label: "โอน", icon: Repeat },
];

interface CartRailProps {
  member: Member | null;
  cart: CartLine[];
  discount: number;
  pointsUsed: number;
  paymentMethod: PaymentMethod | null;
  bahtPerPoint: number;
  onIncrement: (serviceId: string) => void;
  onDecrement: (serviceId: string) => void;
  onRemove: (serviceId: string) => void;
  onSetDiscount: (value: number) => void;
  onSetPointsUsed: (value: number) => void;
  onSetPaymentMethod: (method: PaymentMethod) => void;
  onSelectMember: () => void;
  onBounceToMember: () => void;
  onClearCart: () => void;
  onSuccess: (bill: Bill) => void;
}

export function CartRail({
  member,
  cart,
  discount,
  pointsUsed,
  paymentMethod,
  bahtPerPoint,
  onIncrement,
  onDecrement,
  onRemove,
  onSetDiscount,
  onSetPointsUsed,
  onSetPaymentMethod,
  onSelectMember,
  onBounceToMember,
  onClearCart,
  onSuccess,
}: CartRailProps) {
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const pointsDiscountBaht = pointsUsed * bahtPerPoint;
  const total = Math.max(0, subtotal - discount - pointsDiscountBaht);
  const pointsEarnedPreview = member ? Math.floor(total / bahtPerPoint) : 0;
  const maxPointsUsable = member?.pointBalance ?? 0;
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  async function handleCheckout() {
    if (cart.length === 0) {
      toast.danger("เพิ่มบริการอย่างน้อย 1 รายการก่อนชำระเงิน");
      return;
    }
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
      toast.danger(result.error);
      return;
    }

    onSuccess(result.data);
  }

  return (
    <aside
      id="cart-rail"
      className="flex w-full flex-col border-border border-t bg-background-secondary md:w-[380px] md:shrink-0 md:border-t-0 md:border-l"
    >
      <div className="border-border border-b p-4">
        {member ? (
          <button
            type="button"
            onClick={onSelectMember}
            className="flex w-full items-center gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-3 text-left"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(140deg,var(--accent),#8f7440)] font-bold text-accent-foreground text-base">
              {member.name.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-sm">{member.name}</span>
              <span className="mt-0.5 block text-accent text-xs">
                {member.pointBalance.toLocaleString("th-TH")} คะแนน
              </span>
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSelectMember}
            className="flex w-full items-center gap-3 rounded-2xl border border-border-tertiary border-dashed bg-surface-tertiary p-3 text-left"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-default">
              <User className="size-4.5 text-muted" />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-sm">ลูกค้า Walk-in</span>
              <span className="mt-0.5 block text-muted-2 text-xs">แตะเพื่อระบุสมาชิก &amp; สะสมคะแนน</span>
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="font-semibold text-sm">รายการบริการ</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-2 text-xs">{cartCount} รายการ</span>
          {cart.length > 0 && (
            <button type="button" onClick={onClearCart} className="text-danger text-xs hover:underline">
              ล้างตะกร้า
            </button>
          )}
        </div>
      </div>

      <div className="max-h-64 flex-1 overflow-y-auto px-4 md:max-h-none">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <ShoppingBag className="size-8 text-muted" />
            <p className="text-muted text-xs">
              ยังไม่มีรายการ
              <br />
              แตะบริการทางซ้ายเพื่อเพิ่ม
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-2">
            {cart.map((line) => (
              <CartLineItem
                key={line.serviceId}
                line={line}
                onIncrement={() => onIncrement(line.serviceId)}
                onDecrement={() => onDecrement(line.serviceId)}
                onRemove={() => onRemove(line.serviceId)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-border border-t bg-background-tertiary p-4">
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((method) => (
            <Button
              key={method.value}
              type="button"
              variant={paymentMethod === method.value ? "primary" : "secondary"}
              size="sm"
              onPress={() => onSetPaymentMethod(method.value)}
            >
              <method.icon className="size-4" />
              {method.label}
            </Button>
          ))}
        </div>

        <div className={cn("grid gap-2", member ? "grid-cols-2" : "grid-cols-1")}>
          <TextField
            value={discount === 0 ? "" : String(discount)}
            onChange={(value) => onSetDiscount(Number(value) || 0)}
            fullWidth
          >
            <Label>ส่วนลด (฿)</Label>
            <Input type="number" min={0} placeholder="0" />
          </TextField>
          {member && (
            <TextField
              value={pointsUsed === 0 ? "" : String(pointsUsed)}
              onChange={(value) => onSetPointsUsed(Math.max(0, Math.min(maxPointsUsable, Number(value) || 0)))}
              fullWidth
            >
              <Label>ใช้คะแนน (มี {member.pointBalance.toLocaleString("th-TH")})</Label>
              <Input type="number" min={0} max={maxPointsUsable} placeholder="0" />
            </TextField>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-2">ยอดรวมบริการ</span>
            <span>฿{subtotal.toLocaleString("th-TH")}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-2">ส่วนลด</span>
              <span>-฿{discount.toLocaleString("th-TH")}</span>
            </div>
          )}
          {pointsUsed > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-2">ใช้คะแนน ({pointsUsed})</span>
              <span>-฿{pointsDiscountBaht.toLocaleString("th-TH")}</span>
            </div>
          )}
          <div className="flex items-end justify-between border-border border-t pt-2">
            <span className="font-semibold text-sm">ยอดชำระ</span>
            <span className="font-bold font-heading text-2xl text-accent">฿{total.toLocaleString("th-TH")}</span>
          </div>
          {member && (
            <p className="text-right text-muted-2 text-xs">
              จะได้รับ <span className="font-semibold text-accent">+{pointsEarnedPreview}</span> คะแนน
            </p>
          )}
        </div>

        <Button type="button" size="lg" fullWidth onPress={handleCheckout} isDisabled={submitting}>
          {submitting ? "กำลังบันทึก..." : "ยืนยันการชำระเงิน"}
        </Button>
      </div>
    </aside>
  );
}
