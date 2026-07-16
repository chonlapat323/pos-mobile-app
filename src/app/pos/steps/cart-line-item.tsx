"use client";

import { Button } from "@heroui/react";
import { Minus, Plus, Trash2 } from "lucide-react";

import type { CartLine } from "../types";

interface CartLineItemProps {
  line: CartLine;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function CartLineItem({ line, onIncrement, onDecrement, onRemove }: CartLineItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
      <div className="flex-1">
        <p className="font-medium text-sm">{line.name}</p>
        <p className="text-muted text-xs">฿{line.price.toLocaleString("th-TH")} ต่อรายการ</p>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" size="sm" isIconOnly onPress={onDecrement}>
          <Minus className="size-4" />
        </Button>
        <span className="w-6 text-center text-sm">{line.quantity}</span>
        <Button type="button" variant="secondary" size="sm" isIconOnly onPress={onIncrement}>
          <Plus className="size-4" />
        </Button>
      </div>
      <p className="w-20 text-right font-medium text-sm">฿{(line.price * line.quantity).toLocaleString("th-TH")}</p>
      <Button type="button" variant="danger-soft" size="sm" isIconOnly onPress={onRemove}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
