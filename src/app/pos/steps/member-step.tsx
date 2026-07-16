"use client";

import { useState } from "react";

import { Button, toast } from "@heroui/react";

import { searchMembers } from "../actions";
import type { Member } from "../types";
import { MemberQuickAddForm } from "./member-quick-add-form";
import { MemberSearchBox } from "./member-search-box";
import { MemberSearchResults } from "./member-search-results";

interface MemberStepProps {
  onSelectMember: (member: Member) => void;
  onSkip: () => void;
}

const PHONE_PATTERN = /^[0-9]+$/;

export function MemberStep({ onSelectMember, onSkip }: MemberStepProps) {
  const [results, setResults] = useState<Member[] | null>(null);
  const [lastSearch, setLastSearch] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  async function handleSearch(value: string) {
    setLastSearch(value);
    if (!value.trim()) {
      setResults(null);
      setShowQuickAdd(false);
      return;
    }
    const result = await searchMembers(value.trim());
    if (!result.success) {
      toast.danger(result.error);
      return;
    }
    setResults(result.data);
    setShowQuickAdd(result.data.length === 0);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <MemberSearchBox onSearch={handleSearch} />
      {results && <MemberSearchResults members={results} onSelect={onSelectMember} />}
      {showQuickAdd && (
        <MemberQuickAddForm
          initialPhone={PHONE_PATTERN.test(lastSearch) ? lastSearch : ""}
          onCreated={onSelectMember}
        />
      )}
      <Button type="button" variant="secondary" size="lg" fullWidth onPress={onSkip}>
        ลูกค้า Walk-in (ไม่ระบุสมาชิก)
      </Button>
    </div>
  );
}
