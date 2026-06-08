import { useMutation, useQueryClient } from "@tanstack/react-query";

import * as ProductQRService from "@/apis/product_qr.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type {
  CreateProductQRPayload,
  UpdateProductQRPayload,
} from "@/types/QRProduct";
import { useFetch } from "../useQuery";
import { toast } from "../useToast";

type ProductQRListParams = {
  page: number;
  limit: number;
  search: string;
};

export function useProductQRList(params: ProductQRListParams) {
  return useFetch(["product-qrs", "list", params], () =>
    ProductQRService.getListProductQR(params),
  );
}

export function useProductQRDetail(productId: string) {
  return useFetch(
    ["product-qrs", productId],
    () => ProductQRService.getProductQR(productId),
    {
      enabled: !!productId,
    },
  );
}

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

export function useUpdateProductQR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: UpdateProductQRPayload;
    }) => ProductQRService.updateProductQR(productId, data),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Thành công", "Đã cập nhật nội dung QR sản phẩm");
        queryClient.invalidateQueries({ queryKey: ["product-qrs"] });
        queryClient.invalidateQueries({
          queryKey: ["product-qrs", variables.productId],
        });
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

export function useDeleteProductQR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => ProductQRService.deleteProductQR(productId),
    onSuccess: (data, productId) => {
      if (data.success) {
        toast.success("Thành công", "Đã xóa QR sản phẩm");
        queryClient.invalidateQueries({ queryKey: ["product-qrs"] });
        queryClient.invalidateQueries({ queryKey: ["product-qrs", productId] });
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
