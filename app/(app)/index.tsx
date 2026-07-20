import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/session";

export default function PosScreen() {
  const { user, signOut } = useSession();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-bg px-6">
      <Text className="font-serif text-2xl text-text">POS ขายบริการ</Text>
      <Text className="font-ui text-muted2">เข้าสู่ระบบแล้ว: {user?.name}</Text>
      <Button variant="secondary" onPress={signOut}>
        ออกจากระบบ
      </Button>
    </View>
  );
}
