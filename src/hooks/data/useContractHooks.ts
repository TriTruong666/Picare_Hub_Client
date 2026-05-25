import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ContractService from "@/apis/contract.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type {
  ContractStatus,
  CreateContractPayload,
  SigningCompletePayload,
  SigningSessionPayload,
  UpdateContractPayload,
} from "@/types/Contract";
import { useFetch, useSuspenseFetch } from "../useQuery";
import { toast } from "../useToast";

type ContractListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: ContractStatus;
};

type MutationToastOptions = {
  showSuccessToast?: boolean;
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
/**
 * Hook cập nhật hợp đồng nháp
 */
export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      data,
    }: {
      contractId: string;
      data: UpdateContractPayload;
    }) => ContractService.updateContract(contractId, data),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Thành công", "Đã cập nhật hợp đồng");
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

/**
 * Hook xuất bản hợp đồng nháp sang trạng thái chờ ký
 */
export function usePublishDraftContract(options?: MutationToastOptions) {
  const queryClient = useQueryClient();
  const { showSuccessToast = true } = options ?? {};

  return useMutation({
    mutationFn: (contractId: string) =>
      ContractService.publishDraftContract(contractId),
    onSuccess: (data, contractId) => {
      if (data.success) {
        if (showSuccessToast) {
          toast.success("Thành công", "Đã xuất bản hợp đồng nháp");
        }
        queryClient.invalidateQueries({ queryKey: ["contracts"] });
        queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
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

export function useCreateSigningSession(options?: MutationToastOptions) {
  const queryClient = useQueryClient();
  const { showSuccessToast = true } = options ?? {};

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
        if (showSuccessToast) {
          toast.success("Thành công", "Đã tạo phiên ký");
        }
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

export function usePublishOwnerSignedContract(options?: MutationToastOptions) {
  const queryClient = useQueryClient();
  const { showSuccessToast = true } = options ?? {};

  return useMutation({
    mutationFn: (contractId: string) =>
      ContractService.publishOwnerSignedContract(contractId),
    onSuccess: (data, contractId) => {
      if (data.success) {
        if (showSuccessToast) {
          toast.success("Hoàn tất", "Hợp đồng đã được ký số thành công");
        }
        queryClient.invalidateQueries({ queryKey: ["contracts"] });
        queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
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

export function usePublishCompleteContract(options?: MutationToastOptions) {
  const queryClient = useQueryClient();
  const { showSuccessToast = true } = options ?? {};

  return useMutation({
    mutationFn: (contractId: string) =>
      ContractService.publishCompleteContract(contractId),
    onSuccess: (data, contractId) => {
      if (data.success) {
        if (showSuccessToast) {
          toast.success("Hoàn tất", "Hợp đồng đã hoàn tất đầy đủ chữ ký");
        }
        queryClient.invalidateQueries({ queryKey: ["contracts"] });
        queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
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

export function useCompleteSigningSession(options?: MutationToastOptions) {
  const queryClient = useQueryClient();
  const { showSuccessToast = true } = options ?? {};

  return useMutation({
    mutationFn: ({
      contractId,
      contractSignatureId,
      data,
    }: {
      contractId: string;
      contractSignatureId: string;
      data: SigningCompletePayload;
    }) =>
      ContractService.completeSigningSession(
        data,
        contractId,
        contractSignatureId,
      ),
    onSuccess: (data, variables) => {
      if (data.success) {
        if (showSuccessToast) {
          toast.success("Hoàn tất", "Hợp đồng đã được ký số thành công");
        }
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
