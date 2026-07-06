import { useMutation } from "@tanstack/react-query";

import * as MailService from "@/apis/mail.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type {
  SendEcontractMailTemplatePayload,
  SendLicenseActiveMailTemplatePayload,
} from "@/types/Mail";
import { toast } from "../useToast";

export function useSendEcontractMailTemplate() {
  return useMutation({
    mutationFn: (data: SendEcontractMailTemplatePayload) =>
      MailService.sendEcontractMailTemplate(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã gửi email");
        return;
      }

      const response = data as typeof data & {
        errorCode?: string;
        code?: string;
      };
      const errorCode =
        response.error_code || response.errorCode || response.code;
      toast.error(
        "Thất bại",
        translateErrorMessage(errorCode, response.message),
      );
    },
    onError: (err) => toast.error("Lỗi", getApiErrorMessage(err)),
  });
}

// Backward-compatible alias for existing contract mail callers.
export const usesendEcontractMailTemplate = useSendEcontractMailTemplate;

export function useSendLicenseActiveMailTemplate() {
  return useMutation({
    mutationFn: (data: SendLicenseActiveMailTemplatePayload) =>
      MailService.sendLicenseActiveMailTemplate(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã gửi email");
        return;
      }

      const response = data as typeof data & {
        errorCode?: string;
        code?: string;
      };
      const errorCode =
        response.error_code || response.errorCode || response.code;
      toast.error(
        "Thất bại",
        translateErrorMessage(errorCode, response.message),
      );
    },
    onError: (err) => toast.error("Lỗi", getApiErrorMessage(err)),
  });
}
