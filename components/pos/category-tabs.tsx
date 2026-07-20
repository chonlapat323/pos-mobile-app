import { Pressable, ScrollView, Text, View } from "react-native";

import { Image } from "expo-image";

import { mockPhotoUrl } from "@/lib/palette";
import type { Category } from "@/lib/pos-types";
import { colors } from "@/lib/theme";

interface CategoryTabsProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategoryTabs({ categories, selectedId, onSelect }: CategoryTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5 pb-2">
      {categories.map((category) => {
        const isSelected = selectedId === category.id;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.id)}
            className="flex-row items-center gap-2.5 rounded-2xl border py-1.5 pr-3.5 pl-1.5"
            style={{
              borderColor: isSelected ? colors.accent : colors.border,
              backgroundColor: isSelected ? colors.accentSoft : colors.surface,
            }}
          >
            <View
              className="h-10 w-10 items-center justify-center overflow-hidden rounded-xl"
              style={{ backgroundColor: colors.raised }}
            >
              <Image
                source={{ uri: category.imageUrl || mockPhotoUrl(category.id, 80, 80) }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            </View>
            <Text
              className="whitespace-nowrap font-ui-medium text-[13px]"
              style={{ color: isSelected ? colors.accent : colors.textSoft }}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
