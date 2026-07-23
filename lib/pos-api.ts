import { ApiError, apiFetch, apiUpload, type PaginatedResult } from "./api";
import type {
  Bill,
  BillHistoryItem,
  Category,
  Member,
  MySubscription,
  PaymentMethod,
  PhotoType,
  PurchaseStatus,
  Service,
  Shop,
  SubscriptionHistoryEntry,
  SubscriptionPackage,
  SubscriptionPurchase,
  VisitPhoto,
} from "./pos-types";

type MembersResult = { success: true; data: Member[] } | { success: false; error: string };
type MemberResult = { success: true; data: Member } | { success: false; error: string };
type CategoriesResult = { success: true; data: Category[] } | { success: false; error: string; status?: number };
type ServicesResult = { success: true; data: Service[] } | { success: false; error: string };
type ShopResult = { success: true; data: Shop } | { success: false; error: string; status?: number };
type BillResult = { success: true; data: Bill } | { success: false; error: string };
type BillsResult = { success: true; data: PaginatedResult<BillHistoryItem> } | { success: false; error: string };
type PackagesResult = { success: true; data: SubscriptionPackage[] } | { success: false; error: string };
type MySubscriptionResult = { success: true; data: MySubscription } | { success: false; error: string };
type PurchaseResult = { success: true; data: SubscriptionPurchase } | { success: false; error: string };
type PurchaseStatusResult = { success: true; data: { status: PurchaseStatus } } | { success: false; error: string };
type SubscriptionHistoryResult =
  | { success: true; data: SubscriptionHistoryEntry[] }
  | { success: false; error: string };
type UploadResult = { success: true; data: { url: string } } | { success: false; error: string };
type VisitPhotoResult = { success: true; data: VisitPhoto } | { success: false; error: string };

export async function searchMembers(search: string): Promise<MembersResult> {
  try {
    const result = await apiFetch<PaginatedResult<Member>>(`/members?search=${encodeURIComponent(search)}&pageSize=10`);
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "ค้นหาสมาชิกไม่สำเร็จ" };
  }
}

export async function createMember(input: { phone: string; name: string }): Promise<MemberResult> {
  try {
    const data = await apiFetch<Member>("/members", { method: "POST", body: JSON.stringify(input) });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "เพิ่มสมาชิกไม่สำเร็จ" };
  }
}

export async function getCategories(): Promise<CategoriesResult> {
  try {
    const data = await apiFetch<Category[]>("/service-categories/select");
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : "โหลดกลุ่มบริการไม่สำเร็จ",
      status: error instanceof ApiError ? error.status : undefined,
    };
  }
}

export async function getServicesByCategory(categoryId: string): Promise<ServicesResult> {
  try {
    // No status filter here on purpose - PROMOTION services should still be sellable (and shown
    // with a badge), so only INACTIVE is excluded, done client-side after fetching everything.
    const result = await apiFetch<PaginatedResult<Service>>(
      `/services?categoryId=${encodeURIComponent(categoryId)}&pageSize=100`,
    );
    return { success: true, data: result.data.filter((service) => service.status !== "INACTIVE") };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "โหลดบริการไม่สำเร็จ" };
  }
}

export async function getShopConfig(): Promise<ShopResult> {
  try {
    const data = await apiFetch<Shop>("/shop");
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : "โหลดข้อมูลร้านไม่สำเร็จ",
      status: error instanceof ApiError ? error.status : undefined,
    };
  }
}

export async function getBills(params: {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
}): Promise<BillsResult> {
  try {
    const query = new URLSearchParams();
    if (params.dateFrom) query.set("dateFrom", params.dateFrom);
    if (params.dateTo) query.set("dateTo", params.dateTo);
    if (params.search) query.set("search", params.search);
    query.set("page", String(params.page ?? 1));
    query.set("pageSize", "20");
    const data = await apiFetch<PaginatedResult<BillHistoryItem>>(`/bills?${query.toString()}`);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "โหลดรายการบิลไม่สำเร็จ" };
  }
}

export async function createBill(input: {
  memberId?: string;
  items: { serviceId: string; quantity: number }[];
  discount?: number;
  pointsUsed?: number;
  paymentMethod?: PaymentMethod;
}): Promise<BillResult> {
  try {
    const data = await apiFetch<Bill>("/bills", { method: "POST", body: JSON.stringify(input) });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "ชำระเงินไม่สำเร็จ" };
  }
}

type SubscriptionConfigResult =
  | { success: true; data: { omisePublicKey: string | null } }
  | { success: false; error: string };

export async function getSubscriptionConfig(): Promise<SubscriptionConfigResult> {
  try {
    const data = await apiFetch<{ omisePublicKey: string | null }>("/subscriptions/config");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "โหลดค่าคอนฟิกไม่สำเร็จ" };
  }
}

export async function getSubscriptionPackages(): Promise<PackagesResult> {
  try {
    const data = await apiFetch<SubscriptionPackage[]>("/subscriptions/packages");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "โหลดแพ็กเกจไม่สำเร็จ" };
  }
}

export async function getMySubscription(): Promise<MySubscriptionResult> {
  try {
    const data = await apiFetch<MySubscription>("/subscriptions/me");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "โหลดสถานะแพ็กเกจไม่สำเร็จ" };
  }
}

export async function purchaseSubscription(
  packageId: string,
  payment: { method: "PROMPTPAY" } | { method: "CARD"; omiseToken: string },
): Promise<PurchaseResult> {
  try {
    const data = await apiFetch<SubscriptionPurchase>("/subscriptions/purchase", {
      method: "POST",
      body: JSON.stringify({
        packageId,
        paymentMethod: payment.method,
        omiseToken: payment.method === "CARD" ? payment.omiseToken : undefined,
      }),
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "สร้างรายการชำระเงินไม่สำเร็จ" };
  }
}

export async function getPurchaseStatus(paymentId: string): Promise<PurchaseStatusResult> {
  try {
    const data = await apiFetch<{ status: PurchaseStatus }>(`/subscriptions/purchase/${paymentId}/status`);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "ตรวจสอบสถานะไม่สำเร็จ" };
  }
}

export async function getSubscriptionHistory(): Promise<SubscriptionHistoryResult> {
  try {
    const data = await apiFetch<SubscriptionHistoryEntry[]>("/subscriptions/history");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "โหลดประวัติการชำระเงินไม่สำเร็จ" };
  }
}

export async function uploadImage(uri: string): Promise<UploadResult> {
  try {
    const data = await apiUpload<{ url: string }>("/uploads", {
      uri,
      name: `visit-photo-${Date.now()}.jpg`,
      type: "image/jpeg",
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "อัปโหลดรูปไม่สำเร็จ" };
  }
}

export async function createVisitPhoto(input: {
  memberId: string;
  type: PhotoType;
  imageUrl: string;
  billId?: string;
}): Promise<VisitPhotoResult> {
  try {
    const data = await apiFetch<VisitPhoto>("/photos", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof ApiError ? error.message : "บันทึกรูปไม่สำเร็จ" };
  }
}
