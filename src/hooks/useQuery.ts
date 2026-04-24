/* eslint-disable @typescript-eslint/no-explicit-any */

import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import {
  useQuery,
  useSuspenseQuery,
  type UseQueryOptions,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query";

// Hook cũ (vẫn giữ để dùng cho các chỗ không cần suspense)
export function useFetch<T>(
  queryKey: any[],
  queryFn: () => Promise<BaseResponse<T>>,
  options?: Omit<
    UseQueryOptions<BaseResponse<T>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<BaseResponse<T>, Error>({
    queryKey,
    queryFn: async () => {
      const res = await queryFn();
      if (!res.success) {
        throw new Error(res.message || "Đã xảy ra lỗi khi lấy dữ liệu");
      }
      return res;
    },
    ...options,
  });

  return {
    data: response?.data,
    fullResponse: response as BasePaginatedResponse<T> | undefined,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  };
}

// Hook mới cho Suspense
export function useSuspenseFetch<T>(
  queryKey: any[],
  queryFn: () => Promise<BaseResponse<T>>,
  options?: Omit<
    UseSuspenseQueryOptions<BaseResponse<T>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const { data: response, refetch } = useSuspenseQuery<BaseResponse<T>, Error>({
    queryKey,
    queryFn: async () => {
      const res = await queryFn();
      if (!res.success) {
        throw new Error(res.message || "Đã xảy ra lỗi khi lấy dữ liệu");
      }
      return res;
    },
    ...options,
  });

  return {
    data: response.data,
    fullResponse: response as BasePaginatedResponse<T>,
    refetch,
  };
}
