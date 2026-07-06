import type { BaseResponse } from "@/types/ApiResponse";
import type { sendEcontractMailTemplatePayload } from "@/types/Mail";
import { hubAxiosClient } from "./client";

export const sendEcontractMailTemplate = async (
  payload: sendEcontractMailTemplatePayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post(
    "/api/v1/mail/econtract-template",
    payload,
  );
  return res.data;
};
