import { useMutation, useQueryClient } from "@tanstack/react-query";

import * as ProductQRService from "@/apis/product_qr.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type { CreateProductQRPayload } from "@/types/QRProduct";
import { toast } from "../useToast";

export function useCreateProductQR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductQRPayload) =>
      ProductQRService.createProductQR(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã tạo nội dung QR sản phẩm");
        queryClient.invalidateQueries({ queryKey: ["product-qrs"] });
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
