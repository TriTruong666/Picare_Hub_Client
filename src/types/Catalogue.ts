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
};
