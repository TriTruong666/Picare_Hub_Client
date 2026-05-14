import type { User } from "@/types/User";
import { useFetch } from "../useQuery";
import * as UserService from "@/apis/user.service";

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
