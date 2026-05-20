import * as AuthService from "@/apis/auth.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LoginRequest } from "@/types/Auth";
import type { User } from "@/types/User";
import { getApiErrorMessage } from "@/common/api.error";

/**
 * Hook cho việc đăng nhập hệ thống
 */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => AuthService.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (err) => {
      const message = getApiErrorMessage(err);
      console.error("Login Error:", message);
    },
  });
}

/**
 * Hook cho việc đăng xuất hệ thống
 */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
      const user = queryClient.getQueryData<User>(["auth", "me"]);
      return AuthService.logout({ email: user?.email || "" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
