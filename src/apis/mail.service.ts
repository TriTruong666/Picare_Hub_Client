import type { BaseResponse } from "@/types/ApiResponse";
import type {
  SendEcontractMailTemplatePayload,
  SendLicenseActiveMailTemplatePayload,
} from "@/types/Mail";
import { hubAxiosClient } from "./client";

export const sendEcontractMailTemplate = async (
  payload: SendEcontractMailTemplatePayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post(
    "/api/v1/mail/econtract-template",
    payload,
  );
  return res.data;
};

export const sendLicenseActiveMailTemplate = async (
  payload: SendLicenseActiveMailTemplatePayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post(
    "/api/v1/mail/license-active-template",
    payload,
  );
  return res.data;
};
