"use server";

import { ApiError, apiFetch, type PaginatedResult } from "@/lib/api";

import type { Bill, BillHistoryItem, Category, Member, PaymentMethod, Service, Shop } from "./types";

type MembersResult = { success: true; data: Member[] } | { success: false; error: string };
type MemberResult = { success: true; data: Member } | { success: false; error: string };
type CategoriesResult = { success: true; data: Category[] } | { success: false; error: string };
type ServicesResult = { success: true; data: Service[] } | { success: false; error: string };
type ShopResult = { success: true; data: Shop } | { success: false; error: string };
type BillResult = { success: true; data: Bill } | { success: false; error: string };
type BillsResult = { success: true; data: PaginatedResult<BillHistoryItem> } | { success: false; error: string };

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
    return { success: false, error: error instanceof ApiError ? error.message : "โหลดกลุ่มบริการไม่สำเร็จ" };
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
    return { success: false, error: error instanceof ApiError ? error.message : "โหลดข้อมูลร้านไม่สำเร็จ" };
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
