export type CatalogueDetail = {
  catalogueDetailId: string;
  imageUrl: string;
  imageKey: string;
  sortOrder: number;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CatalogueStatus = "ACTIVE" | "INACTIVE" | string;

export type CatalogueItem = {
  catalogueId: string;
  catalogueName: string;
  status: CatalogueStatus;
  note?: string | null;
  details: CatalogueDetail[];
  createdAt: string;
  updatedAt: string;
};

export type Catalogue = CatalogueItem;

export type CreateCataloguePayload = {
  catalogueName: string;
  note?: string;
  // images là dạng array file kiểu binary
  images: File[];
};

export type UpdateCataloguePayload = {
  catalogueName?: string;
  note?: string;
  // images là dạng array file kiểu binary
  images?: File[];
  status?: CatalogueStatus;
  details?: UpdateCatalogueDetailPayload[];
  // removeDetailIds nhận mảng JSON các catalogueDetailId cần xóa. Ảnh mới luôn được upload vào folder S3 public.
  removeDetailIds?: string[];
};

export type UpdateCatalogueDetailPayload = {
  catalogueDetailId: string;
  sortOrder: number;
};
