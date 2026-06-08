import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import type {
  CreateProductQRPayload,
  ProductQR,
  UpdateProductQRPayload,
} from "@/types/QRProduct";
import { hubAxiosClient } from "./client";

function buildProductQRFormData(
  payload: CreateProductQRPayload | UpdateProductQRPayload,
) {
  const formData = new FormData();
  formData.append("rawContent", payload.rawContent);

  if (payload.image) {
    formData.append("image", payload.image);
  }

  if (payload.note !== undefined && payload.note !== null) {
    formData.append("note", payload.note);
  }

  return formData;
}

export const createProductQR = async (
  payload: CreateProductQRPayload,
): Promise<BaseResponse<ProductQR>> => {
  const res = await hubAxiosClient.post(
    "/api/v1/product-qrs",
    buildProductQRFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
};

export const updateProductQR = async (
  id: string,
  payload: UpdateProductQRPayload,
): Promise<BaseResponse<ProductQR>> => {
  const res = await hubAxiosClient.put(
    `/api/v1/product-qrs/${id}`,
    buildProductQRFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return res.data;
};

export const getListProductQR = async (params: {
  page: number;
  limit: number;
  search: string;
}): Promise<BasePaginatedResponse<ProductQR[]>> => {
  const res = await hubAxiosClient.get("/api/v1/product-qrs", { params });
  return res.data;
};

export const getProductQR = async (
  id: string,
): Promise<BaseResponse<ProductQR>> => {
  const res = await hubAxiosClient.get(`/api/v1/product-qrs/${id}`);
  return res.data;
};

export const deleteProductQR = async (
  id: string,
): Promise<BaseResponse<null>> => {
  const res = await hubAxiosClient.delete(`/api/v1/product-qrs/${id}`);
  return res.data;
};
