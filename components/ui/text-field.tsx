import { forwardRef } from "react";
import { Text, TextInput, type TextInputProps, View } from "react-native";

import { colors } from "@/lib/theme";

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(({ label, error, className = "", ...props }, ref) => {
  return (
    <View className="gap-1.5">
      {label && <Text className="font-ui-medium text-[13px] text-text-soft">{label}</Text>}
      <TextInput
        ref={ref}
        placeholderTextColor={colors.faint}
        className={`rounded-lg border px-4 py-3 font-ui text-[15px] text-text ${
          error ? "border-danger" : "border-border-mid"
        } bg-input-bg ${className}`}
        {...props}
      />
      {error && <Text className="font-ui text-[12px] text-danger">{error}</Text>}
    </View>
  );
});
TextField.displayName = "TextField";
