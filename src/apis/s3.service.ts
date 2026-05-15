import type { BaseResponse } from "@/types/ApiResponse";
import type {
  GetPresignedURLRequest,
  GetPresignedURLResponse,
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
