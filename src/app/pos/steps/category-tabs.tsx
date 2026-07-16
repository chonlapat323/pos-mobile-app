"use client";

import { Tag } from "lucide-react";

import { tintGradient } from "@/lib/palette";
import { cn } from "@/lib/utils";

import type { Category } from "../types";

interface CategoryTabsProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategoryTabs({ categories, selectedId, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {categories.map((category) => {
        const isSelected = selectedId === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={cn(
              "flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border p-2 transition-all active:scale-95",
              isSelected ? "border-accent bg-accent-soft shadow-xs" : "border-border bg-surface hover:bg-default",
            )}
          >
            <div
              className={cn(
                "flex size-16 items-center justify-center overflow-hidden rounded-xl",
                isSelected && "ring-2 ring-accent",
              )}
              style={category.imageUrl ? undefined : { background: tintGradient(category.id) }}
            >
              {category.imageUrl ? (
                // biome-ignore lint/performance/noImgElement: local dev image server, next/image remote-pattern config not worth it yet
                <img src={category.imageUrl} alt="" className="size-full object-cover" />
              ) : (
                <Tag className={cn("size-6", isSelected ? "text-white" : "text-white/70")} strokeWidth={1.8} />
              )}
            </div>
            <span className={cn("max-w-20 truncate font-medium text-xs", isSelected && "text-accent")}>
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
