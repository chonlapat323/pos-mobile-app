"use client";

import { useEffect, useReducer } from "react";

import { Button, toast } from "@heroui/react";
import { LogOut } from "lucide-react";

import { logout } from "@/lib/auth";

import { getCategories, getShopConfig } from "./actions";
import { CartStep } from "./steps/cart-step";
import { MemberStep } from "./steps/member-step";
import { PaymentStep } from "./steps/payment-step";
import { ServiceStep } from "./steps/service-step";
import { SuccessStep } from "./steps/success-step";
import type { Bill, CartLine, Category, Member, PaymentMethod } from "./types";

type Step = "member" | "service" | "cart" | "payment" | "success";

interface PosState {
  step: Step;
  member: Member | null;
  cart: CartLine[];
  discount: number;
  pointsUsed: number;
  paymentMethod: PaymentMethod | null;
  lastBill: Bill | null;
  categories: Category[];
  bahtPerPoint: number;
}

type PosAction =
  | { type: "SET_STEP"; step: Step }
  | { type: "SET_MEMBER"; member: Member | null }
  | { type: "ADD_SERVICE"; serviceId: string; name: string; price: number }
  | { type: "INCREMENT_LINE"; serviceId: string }
  | { type: "DECREMENT_LINE"; serviceId: string }
  | { type: "REMOVE_LINE"; serviceId: string }
  | { type: "SET_DISCOUNT"; value: number }
  | { type: "SET_POINTS_USED"; value: number }
  | { type: "SET_PAYMENT_METHOD"; method: PaymentMethod }
  | { type: "SET_CATEGORIES"; categories: Category[] }
  | { type: "SET_BAHT_PER_POINT"; value: number }
  | { type: "SET_BILL"; bill: Bill }
  | { type: "RESET" };

const initialState: PosState = {
  step: "member",
  member: null,
  cart: [],
  discount: 0,
  pointsUsed: 0,
  paymentMethod: null,
  lastBill: null,
  categories: [],
  bahtPerPoint: 50,
};

function posReducer(state: PosState, action: PosAction): PosState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_MEMBER":
      return { ...state, member: action.member, pointsUsed: 0 };
    case "ADD_SERVICE": {
      const existing = state.cart.find((line) => line.serviceId === action.serviceId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((line) =>
            line.serviceId === action.serviceId ? { ...line, quantity: line.quantity + 1 } : line,
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { serviceId: action.serviceId, name: action.name, price: action.price, quantity: 1 }],
      };
    }
    case "INCREMENT_LINE":
      return {
        ...state,
        cart: state.cart.map((line) =>
          line.serviceId === action.serviceId ? { ...line, quantity: line.quantity + 1 } : line,
        ),
      };
    case "DECREMENT_LINE":
      return {
        ...state,
        cart: state.cart
          .map((line) => (line.serviceId === action.serviceId ? { ...line, quantity: line.quantity - 1 } : line))
          .filter((line) => line.quantity > 0),
      };
    case "REMOVE_LINE":
      return { ...state, cart: state.cart.filter((line) => line.serviceId !== action.serviceId) };
    case "SET_DISCOUNT":
      return { ...state, discount: action.value };
    case "SET_POINTS_USED":
      return { ...state, pointsUsed: action.value };
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.method };
    case "SET_CATEGORIES":
      return { ...state, categories: action.categories };
    case "SET_BAHT_PER_POINT":
      return { ...state, bahtPerPoint: action.value };
    case "SET_BILL":
      return { ...state, lastBill: action.bill, step: "success" };
    case "RESET":
      return { ...initialState, categories: state.categories, bahtPerPoint: state.bahtPerPoint };
    default:
      return state;
  }
}

const STEP_LABELS: Record<Step, string> = {
  member: "1. ลูกค้า",
  service: "2. บริการ",
  cart: "3. ตรวจสอบ",
  payment: "4. ชำระเงิน",
  success: "5. เสร็จสิ้น",
};

interface PosAppProps {
  staffName: string;
}

export function PosApp({ staffName }: PosAppProps) {
  const [state, dispatch] = useReducer(posReducer, initialState);

  useEffect(() => {
    async function prefetch() {
      const [categoriesResult, shopResult] = await Promise.all([getCategories(), getShopConfig()]);
      if (categoriesResult.success) {
        dispatch({ type: "SET_CATEGORIES", categories: categoriesResult.data });
      } else {
        toast.danger(categoriesResult.error);
      }
      if (shopResult.success) {
        dispatch({ type: "SET_BAHT_PER_POINT", value: shopResult.data.bahtPerPoint });
      }
    }
    void prefetch();
  }, []);

  function handleCancel() {
    if (state.step === "member" || state.step === "success") {
      dispatch({ type: "RESET" });
      return;
    }
    if (!confirm("ยกเลิกรายการนี้และเริ่มใหม่?")) return;
    dispatch({ type: "RESET" });
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-border border-b px-4 py-3">
        <div>
          <p className="font-medium text-sm">{STEP_LABELS[state.step]}</p>
          <p className="text-muted text-xs">{staffName}</p>
        </div>
        <div className="flex items-center gap-2">
          {state.step !== "member" && state.step !== "success" && (
            <Button type="button" variant="ghost" size="sm" onPress={handleCancel}>
              ยกเลิกรายการ
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" isIconOnly onPress={() => void logout()}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto p-4">
        {state.step === "member" && (
          <MemberStep
            onSelectMember={(member) => {
              dispatch({ type: "SET_MEMBER", member });
              dispatch({ type: "SET_STEP", step: "service" });
            }}
            onSkip={() => {
              dispatch({ type: "SET_MEMBER", member: null });
              dispatch({ type: "SET_STEP", step: "service" });
            }}
          />
        )}
        {state.step === "service" && (
          <ServiceStep
            categories={state.categories}
            cartCount={state.cart.reduce((sum, line) => sum + line.quantity, 0)}
            onAddService={(service) =>
              dispatch({ type: "ADD_SERVICE", serviceId: service.id, name: service.name, price: service.price })
            }
            onBack={() => dispatch({ type: "SET_STEP", step: "member" })}
            onViewCart={() => dispatch({ type: "SET_STEP", step: "cart" })}
          />
        )}
        {state.step === "cart" && (
          <CartStep
            cart={state.cart}
            onIncrement={(serviceId) => dispatch({ type: "INCREMENT_LINE", serviceId })}
            onDecrement={(serviceId) => dispatch({ type: "DECREMENT_LINE", serviceId })}
            onRemove={(serviceId) => dispatch({ type: "REMOVE_LINE", serviceId })}
            onBack={() => dispatch({ type: "SET_STEP", step: "service" })}
            onProceed={() => dispatch({ type: "SET_STEP", step: "payment" })}
          />
        )}
        {state.step === "payment" && (
          <PaymentStep
            member={state.member}
            cart={state.cart}
            discount={state.discount}
            pointsUsed={state.pointsUsed}
            paymentMethod={state.paymentMethod}
            bahtPerPoint={state.bahtPerPoint}
            onSetDiscount={(value) => dispatch({ type: "SET_DISCOUNT", value })}
            onSetPointsUsed={(value) => dispatch({ type: "SET_POINTS_USED", value })}
            onSetPaymentMethod={(method) => dispatch({ type: "SET_PAYMENT_METHOD", method })}
            onBack={() => dispatch({ type: "SET_STEP", step: "cart" })}
            onBounceToMember={() => {
              dispatch({ type: "SET_MEMBER", member: null });
              dispatch({ type: "SET_STEP", step: "member" });
            }}
            onSuccess={(bill) => dispatch({ type: "SET_BILL", bill })}
          />
        )}
        {state.step === "success" && (
          <SuccessStep
            bill={state.lastBill}
            member={state.member}
            cart={state.cart}
            pointsUsed={state.pointsUsed}
            bahtPerPoint={state.bahtPerPoint}
            staffName={staffName}
            onNewTransaction={() => dispatch({ type: "RESET" })}
          />
        )}
      </main>
    </div>
  );
}
