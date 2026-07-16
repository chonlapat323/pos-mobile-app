"use client";

import { useEffect, useRef, useState } from "react";

import { Button, toast } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";

import { getServicesByCategory } from "../actions";
import type { Category, Service } from "../types";
import { CategoryTabs } from "./category-tabs";
import { ServiceGrid } from "./service-grid";

interface FlyingItem {
  id: number;
  fromX: number;
  fromY: number;
  deltaX: number;
  deltaY: number;
  imageUrl: string | null;
}

const FLY_SIZE = 40;

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
  const cartButtonRef = useRef<HTMLDivElement>(null);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const flyIdRef = useRef(0);

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

  function handleAdd(service: Service, originEl: HTMLElement) {
    onAddService({ id: service.id, name: service.name, price: Number(service.price) });

    const cartRect = cartButtonRef.current?.getBoundingClientRect();
    if (!cartRect) return;
    const originRect = originEl.getBoundingClientRect();

    const fromX = originRect.left + originRect.width / 2 - FLY_SIZE / 2;
    const fromY = originRect.top + originRect.height / 2 - FLY_SIZE / 2;
    const toX = cartRect.left + cartRect.width / 2 - FLY_SIZE / 2;
    const toY = cartRect.top + cartRect.height / 2 - FLY_SIZE / 2;

    const id = flyIdRef.current++;
    setFlyingItems((prev) => [
      ...prev,
      { id, fromX, fromY, deltaX: toX - fromX, deltaY: toY - fromY, imageUrl: service.imageUrl },
    ]);
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <CategoryTabs categories={categories} selectedId={selectedId} onSelect={setSelectedId} />
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-muted text-sm">กำลังโหลด...</p>
        ) : (
          <ServiceGrid services={services} onAdd={handleAdd} />
        )}
      </div>
      <div ref={cartButtonRef} className="flex items-center justify-end border-border border-t pt-3">
        <Button type="button" size="lg" onPress={onViewCart}>
          <ShoppingCart className="size-4" />
          ตรวจสอบตะกร้า
          {cartCount > 0 && (
            <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-accent-foreground/20 font-semibold text-xs">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: item.deltaX, y: item.deltaY, scale: 0.2, opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.7, 1] }}
            onAnimationComplete={() => setFlyingItems((prev) => prev.filter((f) => f.id !== item.id))}
            style={{ position: "fixed", left: item.fromX, top: item.fromY, width: FLY_SIZE, height: FLY_SIZE }}
            className="pointer-events-none z-50 overflow-hidden rounded-full border border-border bg-surface shadow-lg"
          >
            {item.imageUrl ? (
              // biome-ignore lint/performance/noImgElement: local dev image server, next/image remote-pattern config not worth it yet
              <img src={item.imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center bg-accent-soft">
                <ShoppingCart className="size-4 text-accent" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
