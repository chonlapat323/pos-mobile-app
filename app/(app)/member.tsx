import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MemberQuickAddForm } from "@/components/pos/member-quick-add-form";
import { MemberSearchBox } from "@/components/pos/member-search-box";
import { MemberSearchResults } from "@/components/pos/member-search-results";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { usePosCart } from "@/contexts/pos-cart";
import { searchMembers } from "@/lib/pos-api";
import type { Member } from "@/lib/pos-types";
import { colors } from "@/lib/theme";

const PHONE_PATTERN = /^[0-9]+$/;

export default function MemberScreen() {
  const { dispatch } = usePosCart();
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<Member[] | null>(null);
  const [lastSearch, setLastSearch] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  async function handleSearch(value: string) {
    setLastSearch(value);
    if (!value.trim()) {
      setResults(null);
      setShowQuickAdd(false);
      return;
    }
    const result = await searchMembers(value.trim());
    if (!result.success) {
      toast.danger(result.error);
      return;
    }
    setResults(result.data);
    setShowQuickAdd(result.data.length === 0);
  }

  function selectMember(member: Member) {
    dispatch({ type: "SET_MEMBER", member });
    router.back();
  }

  function skip() {
    dispatch({ type: "SET_MEMBER", member: null });
    router.back();
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View className="border-b p-4" style={{ borderColor: colors.border }}>
        <Text className="font-serif text-[17px] text-text">ระบุลูกค้า</Text>
      </View>
      <ScrollView className="flex-1 px-4" contentContainerClassName="gap-4 py-4">
        <MemberSearchBox onSearch={handleSearch} />
        {results && <MemberSearchResults members={results} onSelect={selectMember} />}
        {showQuickAdd && (
          <MemberQuickAddForm
            initialPhone={PHONE_PATTERN.test(lastSearch) ? lastSearch : ""}
            onCreated={selectMember}
          />
        )}
        <Button variant="secondary" fullWidth onPress={skip}>
          ลูกค้า Walk-in (ไม่ระบุสมาชิก)
        </Button>
      </ScrollView>
    </View>
  );
}
