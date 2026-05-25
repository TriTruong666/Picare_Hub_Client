import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as S3Service from "@/apis/s3.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type {
  CreateS3FolderPayload,
  GetPresignedURLRequest,
  UploadS3Request,
} from "@/types/S3";
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

/**
 * Hook lấy danh sách asset từ S3 (DB)
 */
export function useS3Assets(params: {
  folder: string;
  clientId?: string;
  userId?: string;
  assetType?: "image" | "video" | "document" | "audio" | "";
  visibility?: "public" | "private" | "";
  limit: number;
  offset: number;
}) {
  return useFetch(["s3-assets", params], () => S3Service.getS3Assets(params));
}

/**
 * Hook lấy danh sách các folder S3
 */
export function useS3Folders() {
  return useFetch(["s3-folders"], () => S3Service.getS3Folders());
}

/**
 * Hook tạo folder S3
 */
export function useCreateS3Folder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateS3FolderPayload) =>
      S3Service.createS3Folder(payload),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã tạo thư mục mới");
        queryClient.invalidateQueries({ queryKey: ["s3-folders"] });
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

/**
 * Hook tải tập tin từ S3
 */
export function useDownloadS3Asset() {
  return useMutation({
    mutationFn: async (payload: { key: string; originalName: string }) => {
      // Vì API là link redirect để tải trực tiếp (HTTP 302 Redirect hoặc file attachment),
      // việc gọi qua Axios sẽ làm Axios tải toàn bộ file vào bộ nhớ dưới dạng response body thay vì kích hoạt trình duyệt lưu file.
      // Do đó, ta sẽ điều hướng trình duyệt trực tiếp thông qua thẻ <a> để kích hoạt tải xuống tự nhiên.
      const baseUrl = import.meta.env.VITE_HUB_API_URL || "";
      const downloadUrl = `${baseUrl}/api/v1/s3/download/${payload.key}`;

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.target = "_blank";
      a.download = payload.originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      return payload;
    },
    onSuccess: (payload) => {
      toast.success("Thành công", `Đang tải xuống tệp tin: ${payload.originalName}`);
    },
    onError: (err) => toast.error("Lỗi khi tải xuống", getApiErrorMessage(err)),
  });
}

