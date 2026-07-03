import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as LicenseService from "@/apis/license.service";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type { CreateLicensePayload } from "@/types/License";

/**
 * Hook tạo License mới
 */
export function useCreateLicense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLicensePayload) =>
      LicenseService.createLicense(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã tạo bản quyền mới");
        queryClient.invalidateQueries({ queryKey: ["licenses"] });
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
