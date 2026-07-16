"use client";

import { useEffect, useState } from "react";

import { Button, toast } from "@heroui/react";
import { ShoppingCart } from "lucide-react";

import { getServicesByCategory } from "../actions";
import type { Category, Service } from "../types";
import { CategoryTabs } from "./category-tabs";
import { ServiceGrid } from "./service-grid";

interface ServiceStepProps {
  categories: Category[];
  cartCount: number;
  onAddService: (service: { id: string; name: string; price: number }) => void;
  onViewCart: () => void;
}

export function ServiceStep({ categories, cartCount, onAddService, onViewCart }: ServiceStepProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when the category list first arrives, to default-select the first tab
  useEffect(() => {
    if (categories.length > 0 && !selectedId) {
      setSelectedId(categories[0].id);
    }
  }, [categories]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoading(true);
    void getServicesByCategory(selectedId).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (!result.success) {
        toast.danger(result.error);
        return;
      }
      setServices(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <CategoryTabs categories={categories} selectedId={selectedId} onSelect={setSelectedId} />
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-muted text-sm">กำลังโหลด...</p>
        ) : (
          <ServiceGrid
            services={services}
            onAdd={(service) => onAddService({ id: service.id, name: service.name, price: Number(service.price) })}
          />
        )}
      </div>
      <div className="flex items-center justify-end gap-3 border-border border-t pt-3">
        <Button type="button" onPress={onViewCart}>
          <ShoppingCart className="size-4" />
          ตรวจสอบตะกร้า ({cartCount})
        </Button>
      </div>
    </div>
  );
}
