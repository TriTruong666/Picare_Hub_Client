import type { BaseResponse } from "@/types/ApiResponse";
import type { CreateProductQRPayload } from "@/types/QRProduct";
import { hubAxiosClient } from "./client";

export const createProductQR = async (
  payload: CreateProductQRPayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/product-qrs", payload);
  return res.data;
};
