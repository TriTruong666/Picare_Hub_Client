import { useMutation } from "@tanstack/react-query";
import * as MailService from "@/apis/mail.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type { SendMailTemplatePayload } from "@/types/Mail";
import { toast } from "../useToast";

/**
 * Hook gửi email theo template
 */
export function useSendMailTemplate() {
  return useMutation({
    mutationFn: (data: SendMailTemplatePayload) =>
      MailService.sendMailTemplate(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã gửi email");
      } else {
        toast.error(
          "Thất bại",
          translateErrorMessage(data.error_code, data.message),
        );
      }
    },
    onError: (err) => toast.error("Lỗi", getApiErrorMessage(err)),
  });
}
