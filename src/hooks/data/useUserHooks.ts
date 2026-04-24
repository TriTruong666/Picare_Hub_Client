import type { User } from "@/types/User";
import { useFetch } from "../useQuery";
import * as UserService from "@/apis/user.service";

export function useMe() {
  return useFetch<User>(["auth", "me"], () => UserService.getMe());
}
