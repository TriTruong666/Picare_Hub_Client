export type UploadS3Request = {
  file: string;
  folder: string;
  clientId?: string | null;
  description?: string | null;
  visibility: "public" | "private";
};

export type UploadS3Response = {
  key: string;
  url: string;
  etag: string;
};

export type GetPresignedURLRequest = {
  key: string;
  expiresIn: number;
};

export type GetPresignedURLResponse = {
  presignedUrl: string;
  key: string;
  expiresIn: number;
};

export type S3Asset = {
  assetId: string;
  clientId: string;
  userId: string;
  s3Key: string;
  s3Url: string;
  s3Bucket: string;
  s3Region: string;
  etag: string;
  originalName: string;
  mimeType: string;
  assetType: string;
  fileSize: string;
  visibility: "public" | "private";
  folderId: string;
  tags: string[];
  description: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
  folder: S3Folder;
  presignedUrl: string;
};

export type S3Folder = {
  folderId: string;
  name: string;
  description: string;
  assetCount: number;
  totalSize: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateS3FolderPayload = {
  name: string;
  description: string;
};

export type UpdateS3FolderPayload = {
  name: string;
  description: string;
};
