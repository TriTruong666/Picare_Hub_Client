import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import { hubAxiosClient } from "./client";
import type {
  Contract,
  CreateContractPayload,
  CreateContractResponse,
  GenSignLinkResponse,
  SigningCompletePayload,
  SigningCompleteResponse,
  SigningSessionPayload,
  SigningSessionResponse,
  UpdateContractPayload,
} from "@/types/Contract";

export const createContract = async (
  payload: CreateContractPayload,
): Promise<BaseResponse<CreateContractResponse>> => {
  const res = await hubAxiosClient.post(`/api/v1/contracts`, payload);
  return res.data;
};

export const createSigningSession = async (
  payload: SigningSessionPayload,
  contractId: string,
): Promise<BaseResponse<SigningSessionResponse>> => {
  const res = await hubAxiosClient.post(
    `/api/v1/contracts/${contractId}/signing-sessions`,
    payload,
  );
  return res.data;
};

export const completeSigningSession = async (
  payload: SigningCompletePayload,
  contractId: string,
  contractSignatureId: string,
): Promise<BaseResponse<SigningCompleteResponse>> => {
  const res = await hubAxiosClient.post(
    `/api/v1/contracts/${contractId}/signing-sessions/${contractSignatureId}/complete`,
    payload,
  );
  return res.data;
};

export const getContractDetail = async (
  contractId: string,
): Promise<BaseResponse<Contract>> => {
  const res = await hubAxiosClient.get(`/api/v1/contracts/${contractId}`);
  return res.data;
};

export const getContractList = async (params: {
  page: number;
  limit: number;
  search?: string;
  status?: "draft" | "unsigned" | "owner_signed" | "completed" | null;
}): Promise<BasePaginatedResponse<Contract[]>> => {
  const res = await hubAxiosClient.get("/api/v1/contracts", { params });
  return res.data;
};

export const publishDraftContract = async (
  contractId: string,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post(
    `/api/v1/contracts/${contractId}/publish-unsigned`,
  );
  return res.data;
};

export const publishOwnerSignedContract = async (
  contractId: string,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post(
    `/api/v1/contracts/${contractId}/publish-owner-signed`,
  );
  return res.data;
};

export const publishCompleteContract = async (
  contractId: string,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post(
    `/api/v1/contracts/${contractId}/publish-completed`,
  );
  return res.data;
};

export const updateContract = async (
  contractId: string,
  payload: UpdateContractPayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.put(
    `/api/v1/contracts/${contractId}`,
    payload,
  );
  return res.data;
};

export const generateSignLink = async (
  contractId: string,
): Promise<BaseResponse<GenSignLinkResponse>> => {
  const res = await hubAxiosClient.get(
    `api/v1/contracts/${contractId}/signing-link`,
  );
  return res.data;
};
