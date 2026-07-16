"use client";

import { useEffect, useState } from "react";

import { Button, Input, Label, TextField, toast } from "@heroui/react";
import { ChevronLeft, Search } from "lucide-react";

import { getBills } from "../actions";
import { ReceiptView } from "../receipt-view";
import type { BillHistoryItem } from "../types";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "เงินสด",
  TRANSFER: "โอน",
  CARD: "บัตร",
};

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface BillHistoryModalProps {
  shopName: string;
  bahtPerPoint: number;
}

export function BillHistoryModal({ shopName, bahtPerPoint }: BillHistoryModalProps) {
  const [dateFrom, setDateFrom] = useState(todayString());
  const [dateTo, setDateTo] = useState(todayString());
  const [search, setSearch] = useState("");
  const [bills, setBills] = useState<BillHistoryItem[] | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<BillHistoryItem | null>(null);

  async function loadBills() {
    setLoading(true);
    const result = await getBills({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      search: search.trim() || undefined,
    });
    setLoading(false);
    if (!result.success) {
      toast.danger(result.error);
      return;
    }
    setBills(result.data.data);
    setTotal(result.data.total);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: only load once on mount, subsequent loads are explicit via the "ค้นหา" button
  useEffect(() => {
    void loadBills();
  }, []);

  if (selected) {
    const createdAtDate = new Date(selected.createdAt);
    return (
      <div className="flex flex-col gap-4">
        <Button type="button" variant="ghost" size="sm" onPress={() => setSelected(null)}>
          <ChevronLeft className="size-4" />
          กลับไปที่รายการ
        </Button>
        <ReceiptView
          shopName={shopName}
          billId={selected.id}
          createdAt={selected.createdAt}
          memberName={selected.member?.name ?? null}
          staffName={selected.staff.name}
          items={selected.items.map((item) => ({
            key: item.id,
            name: item.service.name,
            quantity: item.quantity,
            lineTotal: Number(item.priceAtSale) * item.quantity,
          }))}
          subtotal={Number(selected.subtotal)}
          discount={Number(selected.discount)}
          pointUsed={selected.pointUsed}
          pointUsedBaht={selected.pointUsed * bahtPerPoint}
          total={Number(selected.total)}
          paymentMethod={selected.paymentMethod}
          pointEarned={selected.pointEarned}
          pointBalanceAfter={null}
        />
        <p className="text-center text-muted text-xs">{createdAtDate.toLocaleString("th-TH")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <TextField value={dateFrom} onChange={setDateFrom} fullWidth>
          <Label>ตั้งแต่วันที่</Label>
          <Input type="date" />
        </TextField>
        <TextField value={dateTo} onChange={setDateTo} fullWidth>
          <Label>ถึงวันที่</Label>
          <Input type="date" />
        </TextField>
      </div>
      <TextField value={search} onChange={setSearch} fullWidth>
        <Label>ค้นหา (ชื่อ/เบอร์โทรลูกค้า หรือชื่อพนักงาน)</Label>
        <Input placeholder="พิมพ์เพื่อค้นหา" />
      </TextField>
      <Button type="button" onPress={loadBills} isDisabled={loading}>
        <Search className="size-4" />
        {loading ? "กำลังค้นหา..." : "ค้นหา"}
      </Button>

      <div className="flex flex-col gap-2">
        {bills === null || loading ? (
          <p className="text-muted text-sm">กำลังโหลด...</p>
        ) : bills.length === 0 ? (
          <p className="text-muted text-sm">ไม่พบรายการ</p>
        ) : (
          <>
            <p className="text-muted text-xs">พบ {total.toLocaleString("th-TH")} รายการ</p>
            {bills.map((bill) => {
              const createdAtDate = new Date(bill.createdAt);
              return (
                <button
                  key={bill.id}
                  type="button"
                  onClick={() => setSelected(bill)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 text-left shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{bill.member ? bill.member.name : "Walk-in"}</p>
                    <p className="text-muted text-xs">
                      {createdAtDate.toLocaleDateString("th-TH")} {createdAtDate.toLocaleTimeString("th-TH")} ·{" "}
                      {bill.staff.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">฿{Number(bill.total).toLocaleString("th-TH")}</p>
                    <p className="text-muted text-xs">
                      {bill.paymentMethod ? (PAYMENT_METHOD_LABELS[bill.paymentMethod] ?? bill.paymentMethod) : "-"}
                    </p>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
