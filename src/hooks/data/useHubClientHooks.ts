import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch, useSuspenseFetch } from "../useQuery";
import * as HubClientService from "@/apis/hub_client.service";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type {
  CreateHubClientInput,
  UpdateHubClientInput,
} from "@/types/HubClient";

/**
 * Hook lấy danh sách Hub Clients
 * @param params Tham số phân trang và tìm kiếm
 */
export function useHubClients(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useFetch(["hub-clients", params], () =>
    HubClientService.getHubClients(params),
  );
}

/**
 * Hook lấy danh sách Hub Clients (Suspense version)
 */
export function useSuspenseHubClients(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useSuspenseFetch(["hub-clients", params], () =>
    HubClientService.getHubClients(params),
  );
}

/**
 * Hook lấy chi tiết Hub Client
 */
export function useHubClientDetail(id: string) {
  return useFetch(
    ["hub-clients", id],
    () => HubClientService.getDetailHubClient(id),
    {
      enabled: !!id,
    },
  );
}

/**
 * Hook lấy chi tiết Hub Client (Suspense version)
 */
export function useSuspenseHubClientDetail(id: string) {
  return useSuspenseFetch(["hub-clients", id], () =>
    HubClientService.getDetailHubClient(id),
  );
}

/**
 * Hook kiểm tra quyền truy cập Hub Client
 */
export function useCheckAccessHubClient(id: string) {
  return useFetch(
    ["hub-clients-access", id],
    () => HubClientService.checkAccessHubClient(id),
    {
      enabled: !!id,
      refetchOnWindowFocus: false, // Tắt tự động refetch khi quay lại tab
    },
  );
}

/**
 * Hook kiểm tra quyền truy cập Hub Client (Suspense version)
 */
export function useSuspenseCheckAccessHubClient(id: string) {
  return useSuspenseFetch(["hub-clients-access", id], () =>
    HubClientService.checkAccessHubClient(id),
  );
}

/**
 * Hook tạo Hub Client mới
 */
export function useCreateHubClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHubClientInput) =>
      HubClientService.createHubClient(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã tạo Hub Client mới");
        queryClient.invalidateQueries({ queryKey: ["hub-clients"] });
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
 * Hook cập nhật Hub Client
 */
export function useUpdateHubClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHubClientInput }) =>
      HubClientService.updateHubClient(id, data),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Thành công", "Đã cập nhật Hub Client");
        queryClient.invalidateQueries({ queryKey: ["hub-clients"] });
        queryClient.invalidateQueries({ queryKey: ["hub-clients", variables.id] });
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
 * Hook xóa Hub Client
 */
export function useDeleteHubClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => HubClientService.deleteHubClient(id),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã xóa Hub Client");
        queryClient.invalidateQueries({ queryKey: ["hub-clients"] });
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
