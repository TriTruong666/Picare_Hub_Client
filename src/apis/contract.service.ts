import type { BaseResponse } from "@/types/ApiResponse";
import { hubAxiosClient } from "./client";
import type {
  Contract,
  CreateContractPayload,
  CreateContractResponse,
  SigningSessionPayload,
  SigningSessionResponse,
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

export const getContractDetail = async (
  contractId: string,
): Promise<BaseResponse<Contract>> => {
  const res = await hubAxiosClient.get(`/api/v1/contracts/${contractId}`);
  return res.data;
};
