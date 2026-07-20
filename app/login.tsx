import { Text, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Sparkle } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";
import { useSession } from "@/contexts/session";
import { colors } from "@/lib/theme";

const formSchema = z.object({
  email: z.email({ message: "กรอกอีเมลให้ถูกต้อง" }),
  password: z.string().min(6, { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }),
});

export default function LoginScreen() {
  const { signIn } = useSession();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // Prefilled with the seeded cashier account for easy local testing - fine for now since
    // this app isn't distributed anywhere yet; remove before any real build ships.
    defaultValues: { email: "cashier@possystem.local", password: "cashier1234" },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const result = await signIn(data.email, data.password);
    if (!result.success) {
      toast.danger(result.error);
      return;
    }
    router.replace("/");
  }

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="flex-1 items-center justify-center p-8"
      bottomOffset={40}
    >
      <View className="w-full max-w-sm gap-7">
        <View className="items-center gap-3">
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.accent }}
          >
            <Sparkle size={26} color={colors.accentText} />
          </View>
          <View className="items-center">
            <Text className="font-serif text-2xl text-text">POS Services</Text>
            <Text className="mt-1 font-ui text-[13px] text-muted">ระบบขายบริการ · เข้าสู่ระบบพนักงาน</Text>
          </View>
        </View>

        <View
          className="gap-4 rounded-2xl border p-6"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        >
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <TextField
                label="อีเมล"
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <TextField
                label="รหัสผ่าน"
                placeholder="••••••••"
                autoCapitalize="none"
                autoComplete="current-password"
                secureTextEntry
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Button fullWidth isLoading={form.formState.isSubmitting} onPress={form.handleSubmit(onSubmit)}>
            {form.formState.isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
