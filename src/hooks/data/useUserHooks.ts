import * as UserService from "@/apis/user.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import { toast } from "@/hooks/useToast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateUserPayload,
  UpdateUserAuthPolicyPayload,
  UpdateUserPayload,
  User,
  UserRole,
} from "@/types/User";
import type { TrustedIpsData } from "@/types/Auth";
import { useFetch } from "../useQuery";

export function useMe() {
  return useFetch<User>(["auth", "me"], () => UserService.getMe());
}

/**
 * Hook lấy danh sách người dùng với phân trang, tìm kiếm và vai trò
 */
export function useUsers(params: {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
}) {
  return useFetch<User[]>(["users", params], () => UserService.getUser(params));
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

export function useUpdateUserInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Pick<UpdateUserPayload, "name" | "phone">;
    }) => UserService.updateUserInfo(data, userId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã cập nhật thông tin cá nhân");
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error(
          "Thất bại",
          translateErrorMessage(data.error_code, data.message),
        );
      }
    },
    onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
  });
}

export function useUpdateUserAuthPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateUserAuthPolicyPayload;
    }) => UserService.updateUserAuthPolicy(userId, payload),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
    },
    onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
  });
}

export function useUserTrustedIps(userId: string, enabled = true) {
  return useFetch<TrustedIpsData>(
    ["users", "trusted-ips", userId],
    () => UserService.getUserTrustedIps(userId),
    { enabled: enabled && Boolean(userId), staleTime: 30 * 1000 },
  );
}

export function useRevokeAllUserTrustedIps() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => UserService.revokeAllUserTrustedIps(userId),
    onSuccess: (data, userId) => {
      if (data.success) {
        toast.success("Thành công", "Đã thu hồi toàn bộ IP tin cậy");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({
          queryKey: ["users", "trusted-ips", userId],
        });
      }
    },
    onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
  });
}
