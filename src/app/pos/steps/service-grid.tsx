"use client";

import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";

import type { Service } from "../types";

interface ServiceGridProps {
  services: Service[];
  onAdd: (service: Service, originEl: HTMLElement) => void;
}

export function ServiceGrid({ services, onAdd }: ServiceGridProps) {
  if (services.length === 0) {
    return <p className="text-muted text-sm">ไม่มีบริการในกลุ่มนี้</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {services.map((service) => (
        <motion.button
          key={service.id}
          type="button"
          onClick={(e) => onAdd(service, e.currentTarget)}
          whileTap={{ scale: 0.92 }}
          className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 text-left shadow-xs"
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
        </motion.button>
      ))}
    </div>
  );
}
