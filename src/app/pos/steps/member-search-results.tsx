"use client";

import { User } from "lucide-react";

import type { Member } from "../types";

interface MemberSearchResultsProps {
  members: Member[];
  onSelect: (member: Member) => void;
}

export function MemberSearchResults({ members, onSelect }: MemberSearchResultsProps) {
  if (members.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => (
        <button
          key={member.id}
          type="button"
          onClick={() => onSelect(member)}
          className="flex items-center justify-between rounded-xl border border-border bg-surface-tertiary p-3 text-left shadow-xs transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-default">
              <User className="size-4 text-muted" />
            </div>
            <div>
              <p className="font-medium text-sm">{member.name}</p>
              <p className="text-muted-2 text-xs">{member.phone}</p>
            </div>
          </div>
          <span className="font-medium text-accent text-sm">{member.pointBalance.toLocaleString("th-TH")} pt</span>
        </button>
      ))}
    </div>
  );
}
