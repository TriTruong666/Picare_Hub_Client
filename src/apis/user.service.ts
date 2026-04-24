import type { BaseResponse } from "@/types/ApiResponse";
import type { User } from "@/types/User";
import { hubAxiosClient } from "./client";

export async function getMe(): Promise<BaseResponse<User>> {
  const res = await hubAxiosClient.get("/api/v1/users/me");
  return res.data;
}
