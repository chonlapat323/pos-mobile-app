import { useEffect, useState } from "react";

import { TextField } from "@/components/ui/text-field";

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
    <TextField
      label="ค้นหาด้วยเบอร์โทรหรือชื่อ"
      placeholder="08xxxxxxxx หรือชื่อสมาชิก"
      value={value}
      onChangeText={setValue}
      autoFocus
    />
  );
}
