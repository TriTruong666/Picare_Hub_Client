import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as S3Service from "@/apis/s3.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type { GetPresignedURLRequest, UploadS3Request } from "@/types/S3";
import { useFetch } from "../useQuery";
import { toast } from "../useToast";

type UseUploadS3AssetOptions = {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
};

/**
 * Hook upload asset lên S3
 */
export function useUploadS3Asset(options?: UseUploadS3AssetOptions) {
  const { showSuccessToast = true, showErrorToast = true } = options ?? {};

  return useMutation({
    mutationFn: (request: UploadS3Request) => S3Service.uploadS3Asset(request),
    onSuccess: (data) => {
      if (data.success) {
        if (showSuccessToast) {
          toast.success("Thành công", "Đã tải tập tin lên hệ thống");
        }
      } else if (showErrorToast) {
        toast.error(
          "Thất bại",
          translateErrorMessage(data.error_code, data.message),
        );
      }
    },
    onError: (err) => {
      if (showErrorToast) {
        toast.error("Lỗi", getApiErrorMessage(err));
      }
    },
  });
}

/**
 * Hook lấy presigned URL cho một key
 * @param request Tham số lấy presigned URL
 */
export function useGetPresignedURL(request: GetPresignedURLRequest) {
  return useFetch(
    ["s3-presigned-url", request],
    () => S3Service.getPresignedURL(request),
    {
      enabled: !!request.key,
      staleTime: (request.expiresIn - 60) * 1000,
    },
  );
}

/**
 * Hook xóa đối tượng trên S3
 */
export function useDeleteS3Object() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => S3Service.deleteS3Object(key),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã xóa tập tin");
        queryClient.invalidateQueries({ queryKey: ["s3-assets"] });
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
