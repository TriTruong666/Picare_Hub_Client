import * as UserService from "@/apis/user.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import { toast } from "@/hooks/useToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateUserPayload, UpdateUserPayload, User } from "@/types/User";
import { useFetch } from "../useQuery";

export function useMe() {
  return useFetch<User>(["auth", "me"], () => UserService.getMe());
}

/**
 * Hook lấy danh sách người dùng với phân trang
 */
export function useUsers(page: number, limit: number) {
  return useFetch<User[]>(["users", { page, limit }], () =>
    UserService.getUser(page, limit),
  );
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => UserService.createUser(payload),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã tạo tài khoản mới");
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error(
          "Thất bại",
          translateErrorMessage(data.error_code, data.message),
        );
      }
    },
    onError: (error) => {
      toast.error("Lỗi", getApiErrorMessage(error));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserPayload;
    }) => UserService.updateUser(payload, userId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã cập nhật tài khoản");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      } else {
        toast.error(
          "Thất bại",
          translateErrorMessage(data.error_code, data.message),
        );
      }
    },
    onError: (error) => {
      toast.error("Lỗi", getApiErrorMessage(error));
    },
  });
}
