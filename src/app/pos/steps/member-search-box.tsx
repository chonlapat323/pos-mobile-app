"use client";

import { useEffect, useState } from "react";

import { Input, Label, TextField } from "@heroui/react";

interface MemberSearchBoxProps {
  onSearch: (value: string) => void;
}

export function MemberSearchBox({ onSearch }: MemberSearchBoxProps) {
  const [value, setValue] = useState("");

  // biome-ignore lint/correctness/useExhaustiveDependencies: debounce reacts to value only; onSearch is a stable callback from the parent
  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value), 400);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <TextField value={value} onChange={setValue} fullWidth>
      <Label>ค้นหาด้วยเบอร์โทรหรือชื่อ</Label>
      <Input placeholder="08xxxxxxxx หรือชื่อสมาชิก" autoFocus />
    </TextField>
  );
}
