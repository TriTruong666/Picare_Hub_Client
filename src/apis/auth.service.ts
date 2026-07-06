import type { BaseResponse } from "@/types/ApiResponse";
import type { ChangePasswordPayload, LoginRequest } from "@/types/Auth";
import { hubAxiosClient } from "./client";

export const login = async (
  data: LoginRequest,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/auth/login", data);
  return res.data;
};
export const logout = async (data: {
  email: string;
}): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/auth/logout", data);
  return res.data;
};

export const changePassword = async (
  data: ChangePasswordPayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/auth/change-password", data);
  return res.data;
};
