"use client";

import { mockPhotoUrl } from "@/lib/palette";
import { cn } from "@/lib/utils";

import type { Category } from "../types";

interface CategoryTabsProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategoryTabs({ categories, selectedId, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-2">
      {categories.map((category) => {
        const isSelected = selectedId === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-2xl border py-1.5 pr-3.5 pl-1.5 transition-all active:scale-95",
              isSelected ? "border-accent bg-accent-soft" : "border-border bg-surface hover:bg-surface-tertiary",
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-default">
              {/* biome-ignore lint/performance/noImgElement: local dev image server, next/image remote-pattern config not worth it yet */}
              <img
                src={category.imageUrl || mockPhotoUrl(category.id, 80, 80)}
                alt=""
                className="size-full object-cover"
              />
            </span>
            <span className={cn("whitespace-nowrap font-medium text-sm", isSelected ? "text-accent" : "text-soft")}>
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
