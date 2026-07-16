"use client";

import { Button, ErrorMessage, Input, Label, TextField, toast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { createMember } from "../actions";
import type { Member } from "../types";

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
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-lg border border-border p-4"
    >
      <p className="font-medium text-sm">ไม่พบสมาชิก — เพิ่มใหม่</p>
      <Controller
        control={form.control}
        name="phone"
        render={({ field, fieldState }) => (
          <TextField
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={fieldState.invalid}
            fullWidth
          >
            <Label>เบอร์โทร</Label>
            <Input placeholder="08xxxxxxxx" />
            {fieldState.invalid && <ErrorMessage>{fieldState.error?.message}</ErrorMessage>}
          </TextField>
        )}
      />
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={fieldState.invalid}
            fullWidth
          >
            <Label>ชื่อ-นามสกุล</Label>
            <Input placeholder="ชื่อสมาชิก" />
            {fieldState.invalid && <ErrorMessage>{fieldState.error?.message}</ErrorMessage>}
          </TextField>
        )}
      />
      <Button type="submit" isDisabled={form.formState.isSubmitting} size="lg">
        {form.formState.isSubmitting ? "กำลังเพิ่ม..." : "เพิ่มสมาชิก"}
      </Button>
    </form>
  );
}
