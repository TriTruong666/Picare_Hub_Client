export type CreateCataloguePayload = {
  catalogueName: string;
  note?: string;
  // images là dạng array file kiểu binary
  images: string[];
};

export type UpdateCataloguePayload = {
  catalogueName?: string;
  note?: string;
  // images là dạng array file kiểu binary
  images?: string[];
};
