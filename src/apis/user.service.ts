import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserAuthPolicyPayload,
  User,
  UserRole,
} from "@/types/User";
import type { TrustedIpsData } from "@/types/Auth";
import { hubAxiosClient } from "./client";

/**
 * Lấy thông tin người dùng hiện tại
 */
export async function getMe(): Promise<BaseResponse<User>> {
  const res = await hubAxiosClient.get("/api/v1/users/me");
  return res.data;
}

/**
 * Láy danh sách người dùng với phân trang
 */
export async function getUser(params: {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
}): Promise<BasePaginatedResponse<User[]>> {
  const res = await hubAxiosClient.get(`/api/v1/users`, { params });
  return res.data;
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<BaseResponse<null>> {
  const res = await hubAxiosClient.post("/api/v1/users", payload);
  return res.data;
}

export async function updateUser(
  payload: UpdateUserPayload,
  userId: string,
): Promise<BaseResponse<null>> {
  const res = await hubAxiosClient.put(`/api/v1/users/${userId}`, payload);
  return res.data;
}

export async function updateUserInfo(
  payload: Pick<UpdateUserPayload, "name" | "phone">,
  userId: string,
): Promise<BaseResponse<null>> {
  const res = await hubAxiosClient.put(`/api/v1/users/${userId}`, payload);
  return res.data;
}

export async function updateUserAuthPolicy(
  userId: string,
  payload: UpdateUserAuthPolicyPayload,
): Promise<BaseResponse<Pick<User, "userId" | "bypassIpVerification">>> {
  const res = await hubAxiosClient.patch(
    `/api/v1/users/${userId}/auth-policy`,
    payload,
  );
  return res.data;
}

export async function revokeAllUserTrustedIps(
  userId: string,
): Promise<BaseResponse<null>> {
  const res = await hubAxiosClient.delete(
    `/api/v1/users/${userId}/trusted-ips`,
  );
  return res.data;
}

export async function getUserTrustedIps(
  userId: string,
): Promise<BaseResponse<TrustedIpsData>> {
  const res = await hubAxiosClient.get(`/api/v1/users/${userId}/trusted-ips`);
  return res.data;
}
