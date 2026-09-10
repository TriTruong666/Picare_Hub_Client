import type { BasePaginatedResponse, BaseResponse } from "@/types/ApiResponse";
import type {
  CreateS3FolderPayload,
  GetPresignedURLRequest,
  GetPresignedURLResponse,
  S3AssetsPage,
  S3Folder,
  UpdateS3FolderPayload,
  UploadS3Request,
  UploadS3Response,
} from "@/types/S3";
import { hubAxiosClient } from "./client";

type QueuedS3Upload = {
  jobId: string;
  key: string;
  status: string;
};

type S3UploadJobStatus = {
  jobId: string;
  status: string;
  shouldPoll: boolean;
  result: UploadS3Response | null;
  failedReason: string | null;
};

const UPLOAD_JOB_POLL_INTERVAL_MS = 750;
const UPLOAD_JOB_TIMEOUT_MS = 30 * 60 * 1000;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForUploadJob(
  jobId: string,
): Promise<BaseResponse<UploadS3Response>> {
  const deadline = Date.now() + UPLOAD_JOB_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const response = await hubAxiosClient.get<BaseResponse<S3UploadJobStatus>>(
      `/api/v1/s3/upload/jobs/${encodeURIComponent(jobId)}`,
    );
    const job = response.data.data;

    if (job?.status === "completed" && job.result) {
      return {
        success: true,
        message: response.data.message,
        data: job.result,
      };
    }

    if (job?.status === "failed") {
      throw new Error(job.failedReason || "Tải tệp lên S3 thất bại");
    }

    await wait(UPLOAD_JOB_POLL_INTERVAL_MS);
  }

  throw new Error("Quá thời gian chờ xử lý tệp trên S3");
}

export async function uploadS3Asset(
  request: UploadS3Request,
): Promise<BaseResponse<UploadS3Response>> {
  let queuedResponse: BaseResponse<QueuedS3Upload>;

  if (typeof request.file !== "string") {
    const formData = new FormData();
    formData.append("file", request.file, request.file.name);
    formData.append("folder", request.folder);
    formData.append("visibility", request.visibility);

    if (request.clientId) {
      formData.append("clientId", request.clientId);
    }
    if (request.description) {
      formData.append("description", request.description);
    }

    const response = await hubAxiosClient.post<BaseResponse<QueuedS3Upload>>(
      "/api/v1/s3/upload",
      formData,
    );
    queuedResponse = response.data;
  } else {
    const response = await hubAxiosClient.post<BaseResponse<QueuedS3Upload>>(
      "/api/v1/s3/upload",
      request,
    );
    queuedResponse = response.data;
  }

  if (!queuedResponse.success || !queuedResponse.data?.jobId) {
    throw new Error(queuedResponse.message || "Không thể tạo job tải tệp");
  }

  return waitForUploadJob(queuedResponse.data.jobId);
}
// Deploy bi loi
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
  // Không dùng offset nữa
  // offset: number;
  cursor?: string;
  search?: string;
}): Promise<BaseResponse<S3AssetsPage>> {
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
