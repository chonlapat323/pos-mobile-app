"use client";

import { useEffect, useReducer, useState } from "react";

import { Button, Modal, toast } from "@heroui/react";
import { History, LogOut, Sparkle, User } from "lucide-react";

import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

import { getCategories, getShopConfig } from "./actions";
import { BillHistoryModal } from "./steps/bill-history-modal";
import { CartRail } from "./steps/cart-rail";
import { MemberStep } from "./steps/member-step";
import { ServiceStep } from "./steps/service-step";
import { SuccessStep } from "./steps/success-step";
import type { Bill, CartLine, Category, Member, PaymentMethod, Shop } from "./types";

interface PosState {
  member: Member | null;
  cart: CartLine[];
  discount: number;
  pointsUsed: number;
  paymentMethod: PaymentMethod | null;
  lastBill: Bill | null;
  categories: Category[];
  shop: Shop | null;
}

type PosAction =
  | { type: "SET_MEMBER"; member: Member | null }
  | { type: "ADD_SERVICE"; serviceId: string; name: string; price: number }
  | { type: "INCREMENT_LINE"; serviceId: string }
  | { type: "DECREMENT_LINE"; serviceId: string }
  | { type: "REMOVE_LINE"; serviceId: string }
  | { type: "CLEAR_CART" }
  | { type: "SET_DISCOUNT"; value: number }
  | { type: "SET_POINTS_USED"; value: number }
  | { type: "SET_PAYMENT_METHOD"; method: PaymentMethod }
  | { type: "SET_CATEGORIES"; categories: Category[] }
  | { type: "SET_SHOP"; shop: Shop }
  | { type: "SET_BILL"; bill: Bill }
  | { type: "RESET" };

const initialState: PosState = {
  member: null,
  cart: [],
  discount: 0,
  pointsUsed: 0,
  paymentMethod: "CASH",
  lastBill: null,
  categories: [],
  shop: null,
};

function posReducer(state: PosState, action: PosAction): PosState {
  switch (action.type) {
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
    case "CLEAR_CART":
      return { ...state, cart: [], discount: 0, pointsUsed: 0, paymentMethod: "CASH" };
    case "SET_DISCOUNT":
      return { ...state, discount: action.value };
    case "SET_POINTS_USED":
      return { ...state, pointsUsed: action.value };
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.method };
    case "SET_CATEGORIES":
      return { ...state, categories: action.categories };
    case "SET_SHOP":
      return { ...state, shop: action.shop };
    case "SET_BILL":
      return { ...state, lastBill: action.bill };
    case "RESET":
      return { ...initialState, categories: state.categories, shop: state.shop };
    default:
      return state;
  }
}

interface PosAppProps {
  staffName: string;
}

export function PosApp({ staffName }: PosAppProps) {
  const [state, dispatch] = useReducer(posReducer, initialState);
  const [isMemberModalOpen, setMemberModalOpen] = useState(false);
  const [isHistoryOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    async function prefetch() {
      const [categoriesResult, shopResult] = await Promise.all([getCategories(), getShopConfig()]);
      if (categoriesResult.success) {
        dispatch({ type: "SET_CATEGORIES", categories: categoriesResult.data });
      } else {
        toast.danger(categoriesResult.error);
      }
      if (shopResult.success) {
        dispatch({ type: "SET_SHOP", shop: shopResult.data });
      } else {
        toast.danger(shopResult.error);
      }
    }
    void prefetch();
  }, []);

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex items-center justify-between gap-2 border-border border-b bg-background-secondary px-5 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          {state.shop?.logoUrl ? (
            // biome-ignore lint/performance/noImgElement: local dev image server, next/image remote-pattern config not worth it yet
            <img
              src={state.shop.logoUrl}
              alt=""
              className="size-10 shrink-0 rounded-xl border border-border object-cover"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(140deg,var(--accent),#8f7440)]">
              <Sparkle className="size-4.5 text-accent-foreground" />
            </div>
          )}
          <div>
            <p className="font-heading font-semibold text-base leading-tight">
              {state.shop?.name ?? "POS Services"}
            </p>
            <p className="text-muted-2 text-xs">เลือกบริการ · {staffName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={state.member ? "secondary" : "outline"}
            size="sm"
            className={cn(
              "!rounded-full",
              state.member && "!border !border-accent/35 !bg-accent-soft !text-accent",
            )}
            onPress={() => setMemberModalOpen(true)}
          >
            <User className="size-4" />
            {state.member ? state.member.name.split(" ")[0] : "ระบุลูกค้า"}
          </Button>
          <Button type="button" variant="ghost" size="sm" isIconOnly onPress={() => setHistoryOpen(true)}>
            <History className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" isIconOnly onPress={() => void logout()}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <ServiceStep
          categories={state.categories}
          onAddService={(service) =>
            dispatch({ type: "ADD_SERVICE", serviceId: service.id, name: service.name, price: service.price })
          }
        />
        <CartRail
          member={state.member}
          cart={state.cart}
          discount={state.discount}
          pointsUsed={state.pointsUsed}
          paymentMethod={state.paymentMethod}
          bahtPerPoint={state.shop?.bahtPerPoint ?? 50}
          onIncrement={(serviceId) => dispatch({ type: "INCREMENT_LINE", serviceId })}
          onDecrement={(serviceId) => dispatch({ type: "DECREMENT_LINE", serviceId })}
          onRemove={(serviceId) => dispatch({ type: "REMOVE_LINE", serviceId })}
          onClearCart={() => dispatch({ type: "CLEAR_CART" })}
          onSetDiscount={(value) => dispatch({ type: "SET_DISCOUNT", value })}
          onSetPointsUsed={(value) => dispatch({ type: "SET_POINTS_USED", value })}
          onSetPaymentMethod={(method) => dispatch({ type: "SET_PAYMENT_METHOD", method })}
          onSelectMember={() => setMemberModalOpen(true)}
          onBounceToMember={() => {
            dispatch({ type: "SET_MEMBER", member: null });
            setMemberModalOpen(true);
          }}
          onSuccess={(bill) => dispatch({ type: "SET_BILL", bill })}
        />
      </div>

      <Modal isOpen={isMemberModalOpen} onOpenChange={setMemberModalOpen}>
        <Modal.Backdrop>
          <Modal.Container size="md">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>ระบุลูกค้า</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <MemberStep
                  onSelectMember={(member) => {
                    dispatch({ type: "SET_MEMBER", member });
                    setMemberModalOpen(false);
                  }}
                  onSkip={() => {
                    dispatch({ type: "SET_MEMBER", member: null });
                    setMemberModalOpen(false);
                  }}
                />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal isOpen={isHistoryOpen} onOpenChange={setHistoryOpen}>
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>ประวัติการขาย</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <BillHistoryModal shopName={state.shop?.name ?? ""} bahtPerPoint={state.shop?.bahtPerPoint ?? 50} />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal
        isOpen={state.lastBill !== null}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "RESET" });
        }}
      >
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.Body>
                <SuccessStep
                  bill={state.lastBill}
                  member={state.member}
                  cart={state.cart}
                  pointsUsed={state.pointsUsed}
                  bahtPerPoint={state.shop?.bahtPerPoint ?? 50}
                  shopName={state.shop?.name ?? ""}
                  staffName={staffName}
                  onNewTransaction={() => dispatch({ type: "RESET" })}
                />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
