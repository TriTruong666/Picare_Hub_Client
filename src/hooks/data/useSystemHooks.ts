import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/common/api.error";
import * as SystemService from "@/apis/system.service";
import { toast } from "@/hooks/useToast";
import type { SystemHealthResponse, SystemLogStatus } from "@/types/System";
import { useFetch } from "../useQuery";

export type SystemHealthCardData = {
  key: "hub" | "oms";
  label: string;
  health: SystemHealthResponse | null;
  error: string | null;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Không thể kết nối tới dịch vụ";
}

export function useSystemHealth() {
  return useQuery<SystemHealthCardData[]>({
    queryKey: ["system-health"],
    queryFn: async () => {
      const [hubResult, omsResult] = await Promise.allSettled([
        SystemService.getHubHealth(),
        SystemService.getOmsHealth(),
      ]);

      return [
        {
          key: "hub" as const,
          label: "Picare Core Hub",
          health: hubResult.status === "fulfilled" ? hubResult.value : null,
          error:
            hubResult.status === "rejected"
              ? getErrorMessage(hubResult.reason)
              : null,
        },
        {
          key: "oms" as const,
          label: "Picare OMS",
          health: omsResult.status === "fulfilled" ? omsResult.value : null,
          error:
            omsResult.status === "rejected"
              ? getErrorMessage(omsResult.reason)
              : null,
        },
      ];
    },
    refetchInterval: 30_000,
  });
}

export function useSystemLogs(params: {
  page: number;
  limit: number;
  status: SystemLogStatus | null;
  search: string;
}) {
  return useFetch(["system-logs", params], () =>
    SystemService.getSystemLogs({
      ...params,
      status: params.status || undefined,
      search: params.search || undefined,
    }),
  );
}

export function useDeleteSystemLogs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.allSettled(ids.map(SystemService.deleteSystemLog)),
    onSuccess: (results) => {
      const successCount = results.filter(
        (result) => result.status === "fulfilled" && result.value.success,
      ).length;
      queryClient.invalidateQueries({ queryKey: ["system-logs"] });

      if (successCount === results.length) {
        toast.success("Thành công", `Đã xóa ${successCount} log hệ thống.`);
      } else if (successCount > 0) {
        toast.warn(
          "Xóa một phần",
          `Đã xóa ${successCount}/${results.length} log hệ thống.`,
        );
      } else {
        toast.error("Thất bại", "Không thể xóa log hệ thống.");
      }
    },
    onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
  });
}
