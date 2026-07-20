import { forwardRef } from "react";
import { ActivityIndicator, Pressable, type PressableProps, Text, type View } from "react-native";

import { colors } from "@/lib/theme";

type Variant = "primary" | "secondary" | "danger-soft";

interface ButtonProps extends PressableProps {
  children: string;
  variant?: Variant;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent",
  secondary: "bg-raised border border-border-mid",
  "danger-soft": "bg-danger-soft",
};

const variantTextClasses: Record<Variant, string> = {
  primary: "text-accent-text font-ui-semibold",
  secondary: "text-text font-ui-medium",
  "danger-soft": "text-danger font-ui-medium",
};

export const Button = forwardRef<View, ButtonProps>(
  ({ children, variant = "primary", isLoading, isDisabled, fullWidth, className = "", ...props }, ref) => {
    const disabled = isDisabled || isLoading;
    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        className={`items-center justify-center rounded-lg px-4 py-3 ${fullWidth ? "w-full" : ""} ${variantClasses[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator color={variant === "primary" ? colors.accentText : colors.text} />
        ) : (
          <Text className={`text-[15px] ${variantTextClasses[variant]}`}>{children}</Text>
        )}
      </Pressable>
    );
  },
);
Button.displayName = "Button";
