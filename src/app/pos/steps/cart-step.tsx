"use client";

import { Button, toast } from "@heroui/react";

import type { CartLine } from "../types";
import { CartLineItem } from "./cart-line-item";

interface CartStepProps {
  cart: CartLine[];
  onIncrement: (serviceId: string) => void;
  onDecrement: (serviceId: string) => void;
  onRemove: (serviceId: string) => void;
  onBack: () => void;
  onProceed: () => void;
}

export function CartStep({ cart, onIncrement, onDecrement, onRemove, onBack, onProceed }: CartStepProps) {
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);

  function handleProceed() {
    if (cart.length === 0) {
      toast.danger("เพิ่มบริการอย่างน้อย 1 รายการก่อนดำเนินการชำระเงิน");
      return;
    }
    onProceed();
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="text-muted text-sm">ยังไม่มีรายการ — เลือกบริการอย่างน้อย 1 รายการ</p>
        ) : (
          <div className="flex flex-col gap-2">
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
      <div className="flex items-center justify-between border-border border-t pt-3">
        <span className="text-muted">ยอดรวม</span>
        <span className="font-semibold text-xl">฿{subtotal.toLocaleString("th-TH")}</span>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" size="lg" onPress={onBack}>
          เพิ่มบริการต่อ
        </Button>
        <Button type="button" size="lg" fullWidth onPress={handleProceed}>
          ดำเนินการชำระเงิน
        </Button>
      </div>
    </div>
  );
}
