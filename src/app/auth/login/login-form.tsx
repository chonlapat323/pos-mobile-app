"use client";

import { useRouter } from "next/navigation";

import { Button, ErrorMessage, Input, Label, TextField, toast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { login } from "@/lib/auth";

const formSchema = z.object({
  email: z.email({ message: "กรอกอีเมลให้ถูกต้อง" }),
  password: z.string().min(6, { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }),
});

export function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "cashier@possystem.local",
      password: "cashier1234",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const result = await login(data.email, data.password);
    if (!result.success) {
      toast.danger(result.error);
      return;
    }
    router.push("/pos");
    router.refresh();
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={fieldState.invalid}
            fullWidth
          >
            <Label>อีเมล</Label>
            <Input type="email" placeholder="you@example.com" autoComplete="email" />
            {fieldState.invalid && <ErrorMessage>{fieldState.error?.message}</ErrorMessage>}
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={fieldState.invalid}
            fullWidth
          >
            <Label>รหัสผ่าน</Label>
            <Input type="password" placeholder="••••••••" autoComplete="current-password" />
            {fieldState.invalid && <ErrorMessage>{fieldState.error?.message}</ErrorMessage>}
          </TextField>
        )}
      />
      <Button type="submit" fullWidth isDisabled={form.formState.isSubmitting} size="lg">
        {form.formState.isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  );
}
