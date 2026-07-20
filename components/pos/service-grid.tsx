import { Pressable, Text, View } from "react-native";

import { Image } from "expo-image";
import { Clock } from "lucide-react-native";

import { mockPhotoUrl } from "@/lib/palette";
import type { Service } from "@/lib/pos-types";
import { colors } from "@/lib/theme";

interface ServiceGridProps {
  services: Service[];
  onAdd: (service: Service) => void;
}

export function ServiceGrid({ services, onAdd }: ServiceGridProps) {
  if (services.length === 0) {
    return <Text className="font-ui text-[13px] text-muted">ไม่มีบริการในกลุ่มนี้</Text>;
  }

  return (
    <View className="flex-row flex-wrap gap-3">
      {services.map((service) => (
        <Pressable
          key={service.id}
          onPress={() => onAdd(service)}
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: colors.border, backgroundColor: colors.surface, width: "47%" }}
        >
          <View
            className="relative aspect-video items-center justify-center overflow-hidden"
            style={{ backgroundColor: colors.raised }}
          >
            <Image
              source={{ uri: service.imageUrl || mockPhotoUrl(service.id) }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
            {service.status === "PROMOTION" && (
              <View
                className="absolute top-2 left-2 rounded-full px-2 py-0.5"
                style={{ backgroundColor: colors.accent }}
              >
                <Text className="font-ui-bold text-[10px] tracking-wide" style={{ color: colors.accentText }}>
                  PROMO
                </Text>
              </View>
            )}
          </View>
          <View className="gap-1.5 p-3">
            <Text className="font-ui-medium text-[13px] text-text leading-tight" numberOfLines={1}>
              {service.name}
            </Text>
            {service.description && (
              <Text className="text-[11px] text-muted leading-tight" numberOfLines={1}>
                {service.description}
              </Text>
            )}
            <View className="mt-0.5 flex-row items-center justify-between">
              <View className="flex-row items-center gap-1">
                <Clock size={11} color={colors.muted} />
                <Text className="text-[11px] text-muted">{service.durationMinutes} นาที</Text>
              </View>
              <Text className="font-ui-bold text-[13px]" style={{ color: colors.accent }}>
                ฿{Number(service.price).toLocaleString("th-TH")}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}
