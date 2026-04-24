import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import { hubAxiosClient } from "./client";
import type { HubClient } from "@/types/HubClient";

export const getHubClients = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<BasePaginatedResponse<HubClient[]>> => {
  const res = await hubAxiosClient.get(`/api/v1/hub-clients`, { params });
  return res.data;
};

export const getDetailHubClient = async (
  clientId: string,
): Promise<BaseResponse<HubClient>> => {
  const res = await hubAxiosClient.get(`/api/v1/hub-clients/${clientId}`);
  return res.data;
};

export const checkAccessHubClient = async (
  clientId: string,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.get(
    `/api/v1/hub-clients/${clientId}/check-access`,
  );
  return res.data;
};
