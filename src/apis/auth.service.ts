import type { BaseResponse } from "@/types/ApiResponse";
import type { LoginRequest } from "@/types/Auth";
import { hubAxiosClient } from "./client";

export const login = async (
  data: LoginRequest,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/auth/login", data);
  return res.data;
};
