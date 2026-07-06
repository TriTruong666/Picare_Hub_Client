import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import type {
  SystemHealthResponse,
  SystemLog,
  SystemLogStatus,
} from "@/types/System";
import { hubAxiosClient, omsAxiosClient } from "./client";

export async function getHubHealth(): Promise<SystemHealthResponse> {
  const response = await hubAxiosClient.get<SystemHealthResponse>("/health");
  return response.data;
}

export async function getOmsHealth(): Promise<SystemHealthResponse> {
  const response = await omsAxiosClient.get<SystemHealthResponse>("/health");
  return response.data;
}

export async function getSystemLogs(params: {
  page: number;
  limit: number;
  status?: SystemLogStatus;
  companyId?: string;
  search?: string;
}): Promise<BasePaginatedResponse<SystemLog[]>> {
  const response = await omsAxiosClient.get("/api/v1/system-job-logs", {
    params,
  });
  return response.data;
}

export async function deleteSystemLog(
  id: string,
): Promise<BaseResponse<null>> {
  const response = await omsAxiosClient.delete(`/api/v1/system-job-logs/${id}`);
  return response.data;
}
