import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="font-medium text-2xl tracking-tight">POS Services — หน้าร้าน</h1>
          <p className="text-muted">เข้าสู่ระบบสำหรับพนักงาน</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
