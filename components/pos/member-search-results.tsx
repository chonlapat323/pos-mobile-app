import { Pressable, Text, View } from "react-native";

import { User } from "lucide-react-native";

import type { Member } from "@/lib/pos-types";
import { colors } from "@/lib/theme";

interface MemberSearchResultsProps {
  members: Member[];
  onSelect: (member: Member) => void;
}

export function MemberSearchResults({ members, onSelect }: MemberSearchResultsProps) {
  if (members.length === 0) return null;

  return (
    <View className="gap-2">
      {members.map((member) => (
        <Pressable
          key={member.id}
          onPress={() => onSelect(member)}
          className="flex-row items-center justify-between rounded-xl border p-3"
          style={{ borderColor: colors.border, backgroundColor: colors.cardAlt }}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.raised }}
            >
              <User size={16} color={colors.muted} />
            </View>
            <View>
              <Text className="font-ui-medium text-[13px] text-text">{member.name}</Text>
              <Text className="text-[11px] text-muted2">{member.phone}</Text>
            </View>
          </View>
          <Text className="font-ui-medium text-[13px]" style={{ color: colors.accent }}>
            {member.pointBalance.toLocaleString("th-TH")} pt
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
