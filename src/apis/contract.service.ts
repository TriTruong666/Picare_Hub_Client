import type { BaseResponse } from "@/types/ApiResponse";
import { hubAxiosClient } from "./client";
import type {
  CreateContractPayload,
  SigningSessionPayload,
  SigningSessionResponse,
} from "@/types/Contract";

export const createContract = async (
  payload: CreateContractPayload,
): Promise<BaseResponse<null>> => {
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
