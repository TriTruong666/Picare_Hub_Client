import type { BaseResponse } from "@/types/ApiResponse";
import type { CreateCataloguePayload } from "@/types/Catalogue";
import { hubAxiosClient } from "./client";

export const createCatalogue = async (
  payload: CreateCataloguePayload,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.post("/api/v1/catalogues", payload);
  return res.data;
};
