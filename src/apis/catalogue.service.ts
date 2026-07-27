import type { BaseResponse } from "@/types/ApiResponse";
import type { CreateCataloguePayload } from "@/types/Catalogue";
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
