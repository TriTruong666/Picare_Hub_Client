import type { BaseResponse } from "@/types/ApiResponse";
import { localSigningAxiosClient } from "./client";
import type {
  CheckHealthResponse,
  CertificateResponse,
  SignPDFCMSResponse,
  SignPDFCMSPayload,
  USBInfoResponse,
} from "@/types/LocalSign";

export const checkLocalSigningService = async (): Promise<
  BaseResponse<CheckHealthResponse>
> => {
  const res = await localSigningAxiosClient.get("/health", { timeout: 3000 });
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
}): Promise<BaseResponse<CertificateResponse>> => {
  const res = await localSigningAxiosClient.get(`/certificate`, {
    params,
  });
  return res.data;
};

export const signPdfCms = async (
  payload: SignPDFCMSPayload,
): Promise<BaseResponse<SignPDFCMSResponse>> => {
  const res = await localSigningAxiosClient.post("/sign-pdf-cms", payload);
  return res.data;
};
