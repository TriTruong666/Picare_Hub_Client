import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import type {
  CreateS3FolderPayload,
  GetPresignedURLRequest,
  GetPresignedURLResponse,
  S3Asset,
  S3Folder,
  UpdateS3FolderPayload,
  UploadS3Request,
  UploadS3Response,
} from "@/types/S3";
import { hubAxiosClient } from "./client";

export async function uploadS3Asset(
  request: UploadS3Request,
): Promise<BaseResponse<UploadS3Response>> {
  const res = await hubAxiosClient.post("/api/v1/s3/upload", request);
  return res.data;
}

export async function getPresignedURL(
  request: GetPresignedURLRequest,
): Promise<BaseResponse<GetPresignedURLResponse>> {
  const res = await hubAxiosClient.get("/api/v1/s3/presigned-url", {
    params: request,
  });
  return res.data;
}

export async function deleteS3Object(key: string): Promise<BaseResponse<null>> {
  const res = await hubAxiosClient.delete(`/api/v1/s3/objects/${key}`);
  return res.data;
}

export async function getS3Assets(params: {
  folder: string;
  clientId?: string;
  userId?: string;
  assetType?: "image" | "video" | "document" | "audio" | "";
  visibility?: "public" | "private" | "";
  limit: number;
  offset: number;
}): Promise<BasePaginatedResponse<S3Asset[]>> {
  const res = await hubAxiosClient.get(`/api/v1/s3/assets`, { params });
  return res.data;
}

export async function downloadS3AssetByKey(
  key: string,
): Promise<BaseResponse<null>> {
  const res = await hubAxiosClient.get(`/api/v1/s3/download/${key}`);
  return res.data;
}

export async function getS3Folders(): Promise<
  BasePaginatedResponse<S3Folder[]>
> {
  const res = await hubAxiosClient.get("/api/v1/s3-folders");
  return res.data;
}

export async function createS3Folder(
  payload: CreateS3FolderPayload,
): Promise<BaseResponse<null>> {
  const res = await hubAxiosClient.post("/api/v1/s3-folders", payload);
  return res.data;
}

export async function updateS3Folder(
  payload: UpdateS3FolderPayload,
  folderId: string,
): Promise<BaseResponse<null>> {
  const res = await hubAxiosClient.put(
    `/api/v1/s3-folders/${folderId}`,
    payload,
  );
  return res.data;
}

export async function deleteS3Folder(
  folderId: string,
): Promise<BaseResponse<null>> {
  const res = await hubAxiosClient.delete(`/api/v1/s3-folders/${folderId}`);
  return res.data;
}
