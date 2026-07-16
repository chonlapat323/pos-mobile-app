import { Sparkle } from "lucide-react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm space-y-7">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,var(--accent),#8f7440)] shadow-lg">
            <Sparkle className="size-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-semibold text-2xl tracking-tight">POS Services</h1>
            <p className="mt-1 text-muted text-sm">ระบบขายบริการ · เข้าสู่ระบบพนักงาน</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
