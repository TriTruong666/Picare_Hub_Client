import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import type { CreateUserPayload, User } from "@/types/User";
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
export async function getUser(
  page: number,
  limit: number,
): Promise<BasePaginatedResponse<User[]>> {
  const res = await hubAxiosClient.get(
    `/api/v1/users?page=${page}&limit=${limit}`,
  );
  return res.data;
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<BaseResponse<null>> {
  const res = await hubAxiosClient.post("/api/v1/users", payload);
  return res.data;
}
