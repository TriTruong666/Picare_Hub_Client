import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import { hubAxiosClient } from "./client";
import type {
  Contract,
  CreateContractPayload,
  CreateContractResponse,
  DeleteCredentialPayload,
  GenSignLinkResponse,
  HandwrittenSignaturePayload,
  SigningCompletePayload,
  SigningCompleteResponse,
  SigningSessionPayload,
  SigningSessionResponse,
  UpdateContractPayload,
  UpdatePartnerSignTypePayload,
  UploadIndividualCredentialPayload,
  UploadOrganizationCredentialPayload,
} from "@/types/Contract";

function getPartnerTokenRequestConfig(token?: string) {
  const normalizedToken = token?.trim();
  if (!normalizedToken) {
    return undefined;
  }

  return {
    params: { token: normalizedToken },
    headers: {
      Authorization: `Bearer ${normalizedToken}`,
      "x-partner-token": normalizedToken,
      "x-contract-token": normalizedToken,
    },
  };
}

export const createContract = async (
  payload: CreateContractPayload,
): Promise<BaseResponse<CreateContractResponse>> => {
  const res = await hubAxiosClient.post(`/api/v1/contracts`, payload);
  return res.data;
};

export const createSigningSession = async (
  payload: SigningSessionPayload,
  contractId: string,
  token?: string,
): Promise<BaseResponse<SigningSessionResponse>> => {
  const res = await hubAxiosClient.post(
    `/api/v1/contracts/${contractId}/signing-sessions`,
    payload,
    getPartnerTokenRequestConfig(token),
  );
  return res.data;
};

export const completeSigningSession = async (
  payload: SigningCompletePayload,
  contractId: string,
  contractSignatureId: string,
  token?: string,
): Promise<BaseResponse<SigningCompleteResponse>> => {
  const res = await hubAxiosClient.post(
    `/api/v1/contracts/${contractId}/signing-sessions/${contractSignatureId}/complete`,
    payload,
    getPartnerTokenRequestConfig(token),
  );
  return res.data;
};

export const getContractDetail = async (
  contractId: string,
  token?: string,
): Promise<BaseResponse<Contract>> => {
  const res = await hubAxiosClient.get(
    `/api/v1/contracts/${contractId}`,
    getPartnerTokenRequestConfig(token),
  );
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
  token?: string,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post(
    `/api/v1/contracts/${contractId}/publish-completed`,
    undefined,
    getPartnerTokenRequestConfig(token),
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
    `/api/v1/contracts/${contractId}/signing-link`,
  );
  return res.data;
};

export const updatePartnerSignType = async (
  contractId: string,
  payload: UpdatePartnerSignTypePayload,
  token?: string,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.patch(
    `/api/v1/contracts/${contractId}/partner-signer-type`,
    payload,
    getPartnerTokenRequestConfig(token),
  );
  return res.data;
};

export const uploadIndividualCredential = async (
  contractId: string,
  token: string,
  payload: UploadIndividualCredentialPayload,
): Promise<BaseResponse<null>> => {
  const formData = new FormData();
  formData.append(
    "first_identification_image",
    payload.first_identification_image,
  );
  formData.append(
    "second_identification_image",
    payload.second_identification_image,
  );
  const requestConfig = getPartnerTokenRequestConfig(token);

  const res = await hubAxiosClient.post(
    `/api/v1/contracts/${contractId}/individual-credential`,
    formData,
    {
      ...requestConfig,
      headers: {
        ...requestConfig?.headers,
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
};

export const uploadOrganizationCredential = async (
  contractId: string,
  token: string,
  payload: UploadOrganizationCredentialPayload,
): Promise<BaseResponse<null>> => {
  const formData = new FormData();
  formData.append("business_license", payload.business_license);
  if (payload.power_of_attorney_image) {
    formData.append("power_of_attorney_image", payload.power_of_attorney_image);
  }
  const requestConfig = getPartnerTokenRequestConfig(token);

  const res = await hubAxiosClient.post(
    `/api/v1/contracts/${contractId}/organization-credential`,
    formData,
    {
      ...requestConfig,
      headers: {
        ...requestConfig?.headers,
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
};

export const uploadHandwrittenSignature = async (
  contractId: string,
  token: string,
  payload: HandwrittenSignaturePayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post(
    `/api/v1/contracts/${contractId}/handwritten-signatures`,
    payload,
    getPartnerTokenRequestConfig(token),
  );
  return res.data;
};

export const deleteCredential = async (
  contractId: string,
  token: string,
  payload: DeleteCredentialPayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.delete(
    `/api/v1/contracts/${contractId}/credential`,
  );
  return res.data;
};
