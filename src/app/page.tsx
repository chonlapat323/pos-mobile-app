import { getApiHealth } from "@/lib/api";

export default async function Home() {
  const health = await getApiHealth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 px-6 font-sans dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">POS Services — หน้าร้าน</h1>
      <p className="text-zinc-600 dark:text-zinc-400">เปิดบิล ค้นหาสมาชิก สะสม/แลก point</p>
      <div className="rounded-lg border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-800">
        {health ? (
          <span className="text-green-600 dark:text-green-400">เชื่อมต่อ pos-backend สำเร็จ ({health.service})</span>
        ) : (
          <span className="text-red-600 dark:text-red-400">
            ยังเชื่อมต่อ pos-backend ไม่ได้ — ตรวจสอบว่า backend รันอยู่ที่พอร์ต 3010
          </span>
        )}
      </div>
    </div>
  );
}
