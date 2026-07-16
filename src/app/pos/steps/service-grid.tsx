"use client";

import { useState } from "react";

import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";

import type { Service } from "../types";

interface ServiceGridProps {
  services: Service[];
  onAdd: (service: Service) => void;
}

export function ServiceGrid({ services, onAdd }: ServiceGridProps) {
  const [pulses, setPulses] = useState<Record<string, number>>({});

  if (services.length === 0) {
    return <p className="text-muted text-sm">ไม่มีบริการในกลุ่มนี้</p>;
  }

  function handleAdd(service: Service) {
    onAdd(service);
    setPulses((prev) => ({ ...prev, [service.id]: (prev[service.id] ?? 0) + 1 }));
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {services.map((service) => (
        <motion.button
          key={service.id}
          type="button"
          onClick={() => handleAdd(service)}
          whileTap={{ scale: 0.92 }}
          className="relative flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 text-left shadow-xs"
        >
          <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-default">
            {service.imageUrl ? (
              // biome-ignore lint/performance/noImgElement: local dev image server, next/image remote-pattern config not worth it yet
              <img src={service.imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <ImageOff className="size-5 text-muted" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">{service.name}</p>
            <p className="font-medium text-accent text-sm">฿{Number(service.price).toLocaleString("th-TH")}</p>
          </div>
          {pulses[service.id] ? (
            <motion.div
              key={pulses[service.id]}
              initial={{ opacity: 0, y: 0, scale: 0.7 }}
              animate={{ opacity: [0, 1, 1, 0], y: [0, -20, -26, -34], scale: [0.7, 1, 1, 0.9] }}
              transition={{ duration: 0.8, times: [0, 0.15, 0.7, 1], ease: "easeOut" }}
              className="pointer-events-none absolute top-2 right-2 rounded-full bg-accent px-2 py-1 font-semibold text-accent-foreground text-xs shadow-md"
            >
              +1
            </motion.div>
          ) : null}
        </motion.button>
      ))}
    </div>
  );
}
