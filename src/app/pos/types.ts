export type PaymentMethod = "CASH" | "TRANSFER" | "CARD";

export interface Member {
  id: string;
  name: string;
  phone: string;
  pointBalance: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  imageUrl: string | null;
  status: "ACTIVE" | "INACTIVE" | "PROMOTION";
  category: { id: string; name: string };
}

export interface CartLine {
  serviceId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Bill {
  id: string;
  subtotal: string;
  discount: string;
  total: string;
  paymentMethod: PaymentMethod | null;
  pointEarned: number;
  pointUsed: number;
  createdAt: string;
}

export interface Shop {
  name: string;
  logoUrl: string | null;
  bahtPerPoint: number;
}
