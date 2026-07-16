import { getCurrentUser } from "@/lib/auth";

import { PosApp } from "./pos-app";

export default async function PosPage() {
  const user = await getCurrentUser();

  return <PosApp staffName={user?.name ?? ""} />;
}
