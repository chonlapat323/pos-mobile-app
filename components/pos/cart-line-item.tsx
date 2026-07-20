import { Pressable, Text, View } from "react-native";

import { Minus, Plus, Trash2 } from "lucide-react-native";

import type { CartLine } from "@/lib/pos-types";
import { colors } from "@/lib/theme";

interface CartLineItemProps {
  line: CartLine;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function CartLineItem({ line, onIncrement, onDecrement, onRemove }: CartLineItemProps) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-xl border p-3"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <View className="min-w-0 flex-1">
        <Text className="font-ui-medium text-[13px] text-text" numberOfLines={1}>
          {line.name}
        </Text>
        <Text className="text-[11px] text-muted2">฿{line.price.toLocaleString("th-TH")} ต่อรายการ</Text>
      </View>
      <View className="flex-row items-center gap-1 rounded-full p-1" style={{ backgroundColor: colors.raised }}>
        <Pressable
          onPress={onDecrement}
          className="h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.raisedHover }}
        >
          <Minus size={14} color={colors.text} />
        </Pressable>
        <Text className="w-6 text-center font-ui-semibold text-[13px] text-text">{line.quantity}</Text>
        <Pressable
          onPress={onIncrement}
          className="h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.accent }}
        >
          <Plus size={14} color={colors.accentText} />
        </Pressable>
      </View>
      <Text className="w-16 shrink-0 text-right font-ui-semibold text-[13px] text-text">
        ฿{(line.price * line.quantity).toLocaleString("th-TH")}
      </Text>
      <Pressable
        onPress={onRemove}
        className="h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: colors.dangerSoft }}
      >
        <Trash2 size={14} color={colors.danger} />
      </Pressable>
    </View>
  );
}
