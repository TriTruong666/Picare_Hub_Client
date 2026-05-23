import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ContractService from "@/apis/contract.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type {
  ContractStatus,
  CreateContractPayload,
  SigningSessionPayload,
} from "@/types/Contract";
import { useFetch, useSuspenseFetch } from "../useQuery";
import { toast } from "../useToast";

type ContractListParams = {
  page: number;
  limit: number;
  search: string;
  status: ContractStatus;
};

/**
 * Hook lấy danh sách hợp đồng
 */
export function useContractList(params: ContractListParams) {
  return useFetch(["contracts", "list", params], () =>
    ContractService.getContractList(params),
  );
}

/**
 * Hook lấy chi tiết hợp đồng
 */
export function useContractDetail(contractId: string) {
  return useFetch(
    ["contracts", contractId],
    () => ContractService.getContractDetail(contractId),
    {
      enabled: !!contractId,
    },
  );
}

/**
 * Hook lấy chi tiết hợp đồng (Suspense version)
 */
export function useSuspenseContractDetail(contractId: string) {
  return useSuspenseFetch(["contracts", contractId], () =>
    ContractService.getContractDetail(contractId),
  );
}

/**
 * Hook tạo hợp đồng mới
 */
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractPayload) =>
      ContractService.createContract(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã tạo hợp đồng mới");
        queryClient.invalidateQueries({ queryKey: ["contracts"] });
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
 * Hook tạo phiên ký cho hợp đồng
 */
export function useCreateSigningSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      data,
    }: {
      contractId: string;
      data: SigningSessionPayload;
    }) => ContractService.createSigningSession(data, contractId),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Thành công", "Đã tạo phiên ký");
        queryClient.invalidateQueries({ queryKey: ["contracts"] });
        queryClient.invalidateQueries({
          queryKey: ["contracts", variables.contractId],
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
