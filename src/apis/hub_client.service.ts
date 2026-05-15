import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import { hubAxiosClient } from "./client";
import type {
  CreateHubClientInput,
  HubClient,
  UpdateHubClientInput,
} from "@/types/HubClient";

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

export const createHubClient = async (
  data: CreateHubClientInput,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post(`/api/v1/hub-clients`, data);
  return res.data;
};

export const updateHubClient = async (
  clientId: string,
  data: UpdateHubClientInput,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.put(`/api/v1/hub-clients/${clientId}`, data);
  return res.data;
};

export const deleteHubClient = async (
  clientId: string,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.delete(`/api/v1/hub-clients/${clientId}`);
  return res.data;
};
