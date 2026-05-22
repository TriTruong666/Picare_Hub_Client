import type { BaseResponse } from "@/types/ApiResponse";
import type { SendMailTemplatePayload } from "@/types/Mail";
import { hubAxiosClient } from "./client";

export const sendMailTemplate = async (
  payload: SendMailTemplatePayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/mail/send-template", payload);
  return res.data;
};
