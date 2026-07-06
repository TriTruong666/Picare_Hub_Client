import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import { hubAxiosClient } from "./client";
import type {
  CreateLicensePayload,
  CreateLicenseTicketPayload,
  License,
  LicenseTicket,
  UpdateLicensePayload,
} from "@/types/License";

export const createLicense = async (
  payload: CreateLicensePayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/licenses", payload);
  return res.data;
};

export const updateLicense = async (
  id: string,
  payload: UpdateLicensePayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.put(`/api/v1/licenses/${id}`, payload);
  return res.data;
};

export const getListLicense = async (params: {
  page: number;
  limit: number;
  search?: string;
}): Promise<BasePaginatedResponse<License[]>> => {
  const res = await hubAxiosClient.get("/api/v1/licenses", { params });
  return res.data;
};

export const getLicenseById = async (
  id: string,
): Promise<BaseResponse<License>> => {
  const res = await hubAxiosClient.get(`/api/v1/licenses/${id}`);
  return res.data;
};

export const getListTicket = async (params: {
  page: number;
  limit: number;
  status: string;
}): Promise<BasePaginatedResponse<LicenseTicket[]>> => {
  const res = await hubAxiosClient.get("/api/v1/licenses/tickets", { params });
  return res.data;
};

export const getDetailTicketByLicenseId = async (
  licenseId: string,
  ticketId: string,
): Promise<BaseResponse<LicenseTicket>> => {
  const res = await hubAxiosClient.get(
    `/api/v1/licenses/${licenseId}/tickets/${ticketId}`,
  );
  return res.data;
};

export const createTicket = async (
  payload: CreateLicenseTicketPayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/licenses/tickets", payload);
  return res.data;
};
