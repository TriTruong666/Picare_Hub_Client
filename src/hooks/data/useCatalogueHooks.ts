import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import * as CatalogueService from "@/apis/catalogue.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type {
  CreateCataloguePayload,
  UpdateCataloguePayload,
} from "@/types/Catalogue";
import { useFetch } from "../useQuery";
import { toast } from "../useToast";

type CatalogueListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
};

/**
 * Hook lấy danh sách Catalogue (phân trang & tìm kiếm)
 */
export function useCatalogueList(params: CatalogueListParams) {
  return useFetch(["catalogues", "list", params], () =>
    CatalogueService.getListCatalogues(params),
  );
}

export function useInfiniteCatalogueList(
  params: Omit<CatalogueListParams, "page">,
) {
  return useInfiniteQuery({
    queryKey: ["catalogues", "infinite-list", params],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await CatalogueService.getListCatalogues({
        ...params,
        page: pageParam,
      });

      if (!response.success) {
        throw new Error(
          response.message || "Đã xảy ra lỗi khi tải danh sách Catalogue",
        );
      }

      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      const itemCount = lastPage.data?.length ?? 0;
      const currentPage = lastPage.pagination?.currentPage ?? allPages.length;
      const totalPages = lastPage.pagination?.totalPages;

      if (totalPages !== undefined) {
        return currentPage < totalPages ? currentPage + 1 : undefined;
      }

      return itemCount === params.limit ? currentPage + 1 : undefined;
    },
  });
}

/**
 * Hook lấy chi tiết Catalogue theo ID
 */
export function useCatalogueDetail(catalogueId: string) {
  return useFetch(
    ["catalogues", catalogueId],
    () => CatalogueService.getDetailCatalogue(catalogueId),
    {
      enabled: !!catalogueId,
    },
  );
}

/**
 * Hook tạo mới Catalogue
 */
export function useCreateCatalogue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCataloguePayload) =>
      CatalogueService.createCatalogue(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã tạo Catalogue mới");
        queryClient.invalidateQueries({ queryKey: ["catalogues"] });
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
 * Hook cập nhật thông tin Catalogue
 */
export function useUpdateCatalogue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      catalogueId,
      payload,
    }: {
      catalogueId: string;
      payload: UpdateCataloguePayload;
    }) => CatalogueService.updateCatalogue(catalogueId, payload),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Thành công", "Đã cập nhật Catalogue");
        queryClient.invalidateQueries({ queryKey: ["catalogues"] });
        queryClient.invalidateQueries({
          queryKey: ["catalogues", variables.catalogueId],
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
 * Hook xóa Catalogue
 */
export function useDeleteCatalogue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (catalogueId: string) =>
      CatalogueService.deleteCatalogue(catalogueId),
    onSuccess: (data, catalogueId) => {
      if (data.success) {
        toast.success("Thành công", "Đã xóa Catalogue");
        queryClient.invalidateQueries({ queryKey: ["catalogues"] });
        queryClient.invalidateQueries({
          queryKey: ["catalogues", catalogueId],
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
