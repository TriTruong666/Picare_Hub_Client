import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ContractService from "@/apis/contract.service";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type { CreateContractPayload } from "@/types/Contract";

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
