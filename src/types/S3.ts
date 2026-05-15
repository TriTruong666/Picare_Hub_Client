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
