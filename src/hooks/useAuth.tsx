/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@/types/User";
import * as UserService from "@/apis/user.service";

// Derive Role directly from the backend User type
export type Role = User["role"];

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await UserService.getMe();
      if (!res.success) throw new Error("Not authenticated");
      return res.data ?? null;
    },
    retry: false,
    staleTime: Infinity, // Dữ liệu sẽ không bao giờ bị coi là cũ cho đến khi bạn tự invalidate
    gcTime: 1000 * 60 * 60 * 24, // 24 tiếng lưu cache trong memory
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const user = isError ? null : (data ?? null);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
