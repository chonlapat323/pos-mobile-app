import { Text, View } from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";
import { createMember } from "@/lib/pos-api";
import type { Member } from "@/lib/pos-types";
import { colors } from "@/lib/theme";

const schema = z.object({
  phone: z.string().min(1, "กรอกเบอร์โทร"),
  name: z.string().min(1, "กรอกชื่อ"),
});

interface MemberQuickAddFormProps {
  initialPhone?: string;
  onCreated: (member: Member) => void;
}

export function MemberQuickAddForm({ initialPhone = "", onCreated }: MemberQuickAddFormProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { phone: initialPhone, name: "" },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    const result = await createMember(data);
    if (!result.success) {
      toast.danger(result.error);
      return;
    }
    toast.success("เพิ่มสมาชิกใหม่แล้ว");
    onCreated(result.data);
  }

  return (
    <View className="gap-3 rounded-lg border p-4" style={{ borderColor: colors.border }}>
      <Text className="font-ui-medium text-[13px] text-text">ไม่พบสมาชิก — เพิ่มใหม่</Text>
      <Controller
        control={form.control}
        name="phone"
        render={({ field, fieldState }) => (
          <TextField
            label="เบอร์โทร"
            placeholder="08xxxxxxxx"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            label="ชื่อ-นามสกุล"
            placeholder="ชื่อสมาชิก"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button fullWidth isLoading={form.formState.isSubmitting} onPress={form.handleSubmit(onSubmit)}>
        {form.formState.isSubmitting ? "กำลังเพิ่ม..." : "เพิ่มสมาชิก"}
      </Button>
    </View>
  );
}
