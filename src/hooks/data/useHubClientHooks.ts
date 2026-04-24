import { useFetch, useSuspenseFetch } from "../useQuery";
import * as HubClientService from "@/apis/hub_client.service";

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
