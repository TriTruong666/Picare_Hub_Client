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

function toHubClientPayload(
  data: CreateHubClientInput | UpdateHubClientInput | FormData,
): FormData | Record<string, unknown> {
  if (data instanceof FormData) {
    return data;
  }

  const hasFile = Boolean(data.logoFile || data.mockupFile);
  if (!hasFile) {
    return data as Record<string, unknown>;
  }

  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === null) {
      formData.append(key, "");
      return;
    }
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}

export const createHubClient = async (
  data: CreateHubClientInput | FormData,
): Promise<BaseResponse<HubClient>> => {
  const payload = toHubClientPayload(data);
  const res = await hubAxiosClient.post(`/api/v1/hub-clients`, payload);
  return res.data;
};

export const updateHubClient = async (
  clientId: string,
  data: UpdateHubClientInput | FormData,
): Promise<BaseResponse<HubClient>> => {
  const payload = toHubClientPayload(data);
  const res = await hubAxiosClient.put(`/api/v1/hub-clients/${clientId}`, payload);
  return res.data;
};

export const deleteHubClient = async (
  clientId: string,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.delete(`/api/v1/hub-clients/${clientId}`);
  return res.data;
};
