import { useMutation } from "@tanstack/react-query";
import * as AuthService from "@/apis/auth.service";
import type { LoginRequest } from "@/types/Auth";
import { getApiErrorMessage } from "@/common/api.error";

/**
 * Hook cho việc đăng nhập hệ thống
 */
export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => AuthService.login(data),
    onError: (err) => {
      const message = getApiErrorMessage(err);
      console.error("Login Error:", message);
    },
  });
}
