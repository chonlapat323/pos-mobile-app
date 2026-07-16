"use client";

import { cn } from "@/lib/utils";

import type { Category } from "../types";

interface CategoryTabsProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategoryTabs({ categories, selectedId, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={cn(
            "shrink-0 rounded-full border px-5 py-2.5 font-medium text-sm transition-colors active:scale-95",
            selectedId === category.id
              ? "border-accent bg-accent text-accent-foreground shadow-xs"
              : "border-border bg-surface text-foreground/80 hover:bg-default",
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
