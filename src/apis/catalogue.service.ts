import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import type {
  Catalogue,
  CreateCataloguePayload,
  UpdateCataloguePayload,
} from "@/types/Catalogue";
import { hubAxiosClient } from "./client";

export const createCatalogue = async (
  payload: CreateCataloguePayload,
): Promise<BaseResponse<null>> => {
  const formData = new FormData();
  formData.append("catalogueName", payload.catalogueName);

  if (payload.note?.trim()) {
    formData.append("note", payload.note.trim());
  }

  payload.images.forEach((image) => formData.append("images", image));

  const res = await hubAxiosClient.post("/api/v1/catalogues", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getListCatalogues = async (params: {
  page: number;
  limit: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}): Promise<BasePaginatedResponse<Catalogue[]>> => {
  const res = await hubAxiosClient.get("/api/v1/catalogues", { params });
  return res.data;
};

export const getDetailCatalogue = async (
  catalogueId: string,
): Promise<BaseResponse<Catalogue>> => {
  const res = await hubAxiosClient.get(`/api/v1/catalogues/${catalogueId}`);
  return res.data;
};

export const updateCatalogue = async (
  catalogueId: string,
  payload: UpdateCataloguePayload,
) => {
  const hasFiles = payload.images && payload.images.length > 0;

  if (hasFiles) {
    const formData = new FormData();
    if (payload.catalogueName)
      formData.append("catalogueName", payload.catalogueName);
    if (payload.note) formData.append("note", payload.note);
    if (payload.status) formData.append("status", payload.status);

    payload.images?.forEach((image) => formData.append("images", image));

    if (payload.details && payload.details.length > 0) {
      formData.append("details", JSON.stringify(payload.details));
    }

    if (payload.removeDetailIds && payload.removeDetailIds.length > 0) {
      formData.append(
        "removeDetailIds",
        JSON.stringify(payload.removeDetailIds),
      );
    }

    const res = await hubAxiosClient.put(
      `/api/v1/catalogues/${catalogueId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  }

  const res = await hubAxiosClient.put(
    `/api/v1/catalogues/${catalogueId}`,
    payload,
  );
  return res.data;
};

export const deleteCatalogue = async (catalogueId: string) => {
  const res = await hubAxiosClient.delete(`/api/v1/catalogues/${catalogueId}`);
  return res.data;
};
