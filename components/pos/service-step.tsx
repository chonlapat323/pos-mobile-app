import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { toast } from "@/components/ui/toast";
import { usePosCart } from "@/contexts/pos-cart";
import { getServicesByCategory } from "@/lib/pos-api";
import type { Service } from "@/lib/pos-types";

import { CategoryTabs } from "./category-tabs";
import { ServiceGrid } from "./service-grid";

export function ServiceStep() {
  const { state, dispatch } = usePosCart();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when the category list first arrives, to default-select the first tab
  useEffect(() => {
    if (state.categories.length > 0 && !selectedId) {
      setSelectedId(state.categories[0].id);
    }
  }, [state.categories]);

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

  function handleAdd(service: Service) {
    dispatch({ type: "ADD_SERVICE", serviceId: service.id, name: service.name, price: Number(service.price) });
  }

  return (
    <View className="flex-1 gap-3">
      <View className="px-4 pt-3">
        <CategoryTabs categories={state.categories} selectedId={selectedId} onSelect={setSelectedId} />
      </View>
      <ScrollView className="flex-1 px-4" contentContainerClassName="pb-5">
        {loading ? (
          <Text className="font-ui text-[13px] text-muted">กำลังโหลด...</Text>
        ) : (
          <ServiceGrid services={services} onAdd={handleAdd} />
        )}
      </ScrollView>
    </View>
  );
}
