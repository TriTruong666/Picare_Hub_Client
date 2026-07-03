import type { BaseResponse } from "@/types/ApiResponse";
import { hubAxiosClient } from "./client";
import type { CreateLicensePayload } from "@/types/License";

export const createLicense = async (
  payload: CreateLicensePayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/licenses", payload);
  return res.data;
};
