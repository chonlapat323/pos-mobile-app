"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

import { mockPhotoUrl } from "@/lib/palette";

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
          whileTap={{ scale: 0.96 }}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-xs"
        >
          <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-default">
            {/* biome-ignore lint/performance/noImgElement: local dev image server, next/image remote-pattern config not worth it yet */}
            <img src={service.imageUrl || mockPhotoUrl(service.id)} alt="" className="size-full object-cover" />
            {service.status === "PROMOTION" && (
              <span className="absolute top-2 left-2 rounded-full bg-accent px-2 py-0.5 font-bold text-[10px] text-accent-foreground tracking-wide">
                PROMO
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5 p-3">
            <p className="font-medium text-sm leading-tight">{service.name}</p>
            {service.description && (
              <p className="line-clamp-1 text-muted text-xs leading-tight">{service.description}</p>
            )}
            <div className="mt-0.5 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] text-muted">
                <Clock className="size-3" />
                {service.durationMinutes} นาที
              </span>
              <span className="font-bold text-accent text-sm">฿{Number(service.price).toLocaleString("th-TH")}</span>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
