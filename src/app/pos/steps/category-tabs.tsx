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
            "shrink-0 rounded-full border px-4 py-2 text-sm",
            selectedId === category.id
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border text-foreground/80",
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
