import { createContext, use, useEffect, useReducer, type PropsWithChildren } from "react";

import { toast } from "@/components/ui/toast";
import { getCategories, getShopConfig } from "@/lib/pos-api";
import type { Bill, CartLine, Category, Member, PaymentMethod, Shop } from "@/lib/pos-types";

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

interface PosCartContextValue {
  state: PosState;
  dispatch: React.Dispatch<PosAction>;
}

const PosCartContext = createContext<PosCartContextValue | null>(null);

export function usePosCart() {
  const value = use(PosCartContext);
  if (!value) throw new Error("usePosCart must be used within a <PosCartProvider />");
  return value;
}

export function PosCartProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(posReducer, initialState);

  useEffect(() => {
    async function prefetch() {
      const [categoriesResult, shopResult] = await Promise.all([getCategories(), getShopConfig()]);
      if (categoriesResult.success) {
        dispatch({ type: "SET_CATEGORIES", categories: categoriesResult.data });
      } else if (categoriesResult.status !== 401) {
        // A 401 here means the shop is suspended/expired - the login screen or the
        // subscription screen already surfaces that, so don't pile on a second toast.
        toast.danger(categoriesResult.error);
      }
      if (shopResult.success) {
        dispatch({ type: "SET_SHOP", shop: shopResult.data });
      } else if (shopResult.status !== 401) {
        toast.danger(shopResult.error);
      }
    }
    void prefetch();
  }, []);

  return <PosCartContext value={{ state, dispatch }}>{children}</PosCartContext>;
}
