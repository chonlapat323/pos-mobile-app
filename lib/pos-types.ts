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
  imageUrl: string | null;
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

export interface BillHistoryItem {
  id: string;
  createdAt: string;
  subtotal: string;
  discount: string;
  total: string;
  paymentMethod: PaymentMethod | null;
  pointEarned: number;
  pointUsed: number;
  member: { id: string; name: string; phone: string } | null;
  staff: { id: string; name: string };
  items: { id: string; quantity: number; priceAtSale: string; service: { id: string; name: string } }[];
}

export type PackageCode = "TRIAL_60" | "SIX_MONTH" | "ONE_YEAR";

export interface SubscriptionPackage {
  id: string;
  code: PackageCode;
  name: string;
  priceThb: number;
  durationDays: number;
  isTrial: boolean;
}

export interface MySubscription {
  subscriptionStatus: "PENDING" | "TRIALING" | "ACTIVE" | "EXPIRED";
  subscriptionEndsAt: string | null;
  isActive: boolean;
  trialUsed: boolean;
  currentPackage: SubscriptionPackage | null;
}

export interface SubscriptionPurchase {
  paymentId: string;
  qrImageUri: string | null;
  expiresAt: string | null;
  authorizeUri: string | null;
}

export type PurchaseStatus = "PENDING" | "PAID" | "FAILED";

export interface SubscriptionHistoryEntry {
  id: string;
  status: "PENDING" | "TRIALING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  startAt: string;
  endAt: string;
  createdAt: string;
  package: SubscriptionPackage;
  payments: { id: string; amountThb: number; status: PurchaseStatus; paidAt: string | null }[];
}

export type PhotoType = "BEFORE" | "AFTER";

export interface VisitPhoto {
  id: string;
  billId: string | null;
  memberId: string;
  type: PhotoType;
  imageUrl: string;
  createdAt: string;
}
