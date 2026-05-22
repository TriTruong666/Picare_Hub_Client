import type { BaseResponse } from "@/types/ApiResponse";
import { localSigningAxiosClient } from "./client";
import type {
  CheckHealthResponse,
  SignPDFCMSPayload,
  USBInfoResponse,
} from "@/types/LocalSign";

export const checkLocalSigningService = async (): Promise<
  BaseResponse<CheckHealthResponse>
> => {
  const res = await localSigningAxiosClient.get("/health");
  return res.data;
};

export const getUSBInfo = async (): Promise<
  BaseResponse<USBInfoResponse[]>
> => {
  const res = await localSigningAxiosClient.get("/tokens");
  return res.data;
};

export const getCertificate = async (params: {
  certificateId: string;
  vendor: string;
}): Promise<BaseResponse<string>> => {
  const res = await localSigningAxiosClient.get(`/certificates`, {
    params,
  });
  return res.data;
};

export const signPdfCms = async (
  payload: SignPDFCMSPayload,
): Promise<BaseResponse<null>> => {
  const res = await localSigningAxiosClient.post("/sign-pdf-cms", payload);
  return res.data;
};
