import type { BaseResponse } from "@/types/ApiResponse";
import { hubAxiosClient } from "./client";
import type { CreateContractPayload } from "@/types/Contract";

export const createContract = async (
  payload: CreateContractPayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post(`/api/v1/contracts`, payload);
  return res.data;
};
