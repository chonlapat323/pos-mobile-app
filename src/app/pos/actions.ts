"use server";

import { ApiError, apiFetch, type PaginatedResult } from "@/lib/api";

import type { Bill, Category, Member, PaymentMethod, Service, Shop } from "./types";

type MembersResult = { success: true; data: Member[] } | { success: false; error: string };
type MemberResult = { success: true; data: Member } | { success: false; error: string };
type CategoriesResult = { success: true; data: Category[] } | { success: false; error: string };
type ServicesResult = { success: true; data: Service[] } | { success: false; error: string };
type ShopResult = { success: true; data: Shop } | { success: false; error: string };
type BillResult = { success: true; data: Bill } | { success: false; error: string };

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
    const result = await apiFetch<PaginatedResult<Service>>(
      `/services?categoryId=${encodeURIComponent(categoryId)}&status=ACTIVE&pageSize=100`,
    );
    return { success: true, data: result.data };
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
