import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch, useSuspenseFetch } from "../useQuery";
import * as LicenseService from "@/apis/license.service";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type {
  CreateLicensePayload,
  CreateLicenseTicketPayload,
  UpdateLicensePayload,
} from "@/types/License";

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

/**
 * Hook cập nhật License
 */
export function useUpdateLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateLicensePayload;
    }) => LicenseService.updateLicense(id, payload),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Thành công", "Đã cập nhật bản quyền");
        queryClient.invalidateQueries({ queryKey: ["licenses"] });
        queryClient.invalidateQueries({
          queryKey: ["licenses", variables.id],
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

/**
 * Hook lấy danh sách License
 */
export function useLicenses(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  return useFetch(["licenses", params], () =>
    LicenseService.getListLicense(params),
  );
}

/**
 * Hook lấy danh sách License (Suspense version)
 */
export function useSuspenseLicenses(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  return useSuspenseFetch(["licenses", params], () =>
    LicenseService.getListLicense(params),
  );
}

/**
 * Hook lấy chi tiết License
 */
export function useLicenseDetail(id: string) {
  return useFetch(
    ["licenses", id],
    () => LicenseService.getLicenseById(id),
    {
      enabled: !!id,
    },
  );
}

/**
 * Hook lấy chi tiết License (Suspense version)
 */
export function useSuspenseLicenseDetail(id: string) {
  return useSuspenseFetch(["licenses", id], () =>
    LicenseService.getLicenseById(id),
  );
}

/**
 * Hook lấy danh sách ticket hỗ trợ kỹ thuật
 */
export function useLicenseTickets(params: {
  page: number;
  limit: number;
  status: string;
}) {
  return useFetch(["license-tickets", params], () =>
    LicenseService.getListTicket(params),
  );
}

/**
 * Hook lấy danh sách ticket hỗ trợ kỹ thuật (Suspense version)
 */
export function useSuspenseLicenseTickets(params: {
  page: number;
  limit: number;
  status: string;
}) {
  return useSuspenseFetch(["license-tickets", params], () =>
    LicenseService.getListTicket(params),
  );
}

/**
 * Hook lấy chi tiết ticket theo License ID và Ticket ID
 */
export function useLicenseTicketDetail(licenseId: string, ticketId: string) {
  return useFetch(
    ["license-tickets", licenseId, ticketId],
    () => LicenseService.getDetailTicketByLicenseId(licenseId, ticketId),
    {
      enabled: !!licenseId && !!ticketId,
    },
  );
}

/**
 * Hook lấy chi tiết ticket theo License ID và Ticket ID (Suspense version)
 */
export function useSuspenseLicenseTicketDetail(licenseId: string, ticketId: string) {
  return useSuspenseFetch(["license-tickets", licenseId, ticketId], () =>
    LicenseService.getDetailTicketByLicenseId(licenseId, ticketId),
  );
}

/**
 * Hook tạo Ticket mới
 */
export function useCreateLicenseTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLicenseTicketPayload) =>
      LicenseService.createTicket(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã gửi yêu cầu hỗ trợ mới");
        queryClient.invalidateQueries({ queryKey: ["license-tickets"] });
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
