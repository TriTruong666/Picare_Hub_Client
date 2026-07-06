import type { BaseResponse } from "@/types/ApiResponse";
import { hubAxiosClient } from "./client";
import type { CreateLicensePayload, License } from "@/types/License";

export const createLicense = async (
  payload: CreateLicensePayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/licenses", payload);
  return res.data;
};

export const getListLicense = async (params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<BaseResponse<License[]>> => {
  const res = await hubAxiosClient.get("/api/v1/licenses", { params });
  return res.data;
};

export const getLicenseById = async (
  id: string,
): Promise<BaseResponse<License>> => {
  const res = await hubAxiosClient.get(`/api/v1/licenses/${id}`);
  return res.data;
};
