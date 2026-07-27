import { useMutation, useQueryClient } from "@tanstack/react-query";

import * as CatalogueService from "@/apis/catalogue.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type { CreateCataloguePayload } from "@/types/Catalogue";
import { toast } from "../useToast";

/**
 * Hook tạo mới Catalogue
 */
export function useCreateCatalogue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCataloguePayload) =>
      CatalogueService.createCatalogue(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã tạo Catalogue mới");
        queryClient.invalidateQueries({ queryKey: ["catalogues"] });
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
