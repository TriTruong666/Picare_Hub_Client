import type { StringNullableChain } from "lodash";

export type CreateProductQRPayload = {
  rawContent: string;
  image?: File | null;
  note?: string | null;
};

export type UpdateProductQRPayload = {
  rawContent: string;
  image?: File | null;
  note?: string | null;
};

export type ProductQR = {
  productId: string;
  rawContent: string;
  note?: string | null;
  jsonContent: ProductQRJson;
  createdAt: string;
  updatedAt: string;
  linkUrl: string;
  qrImage?: string | null;
  imageUrl?: string | null;
};

type ProductQRJson = {
  uses: string;
  qrUrl: string;
  origin: string;
  storage: string;
  website: string;
  warnings: string;
  netVolume: string;
  productId: string;
  shelfLife: string;
  batchNumber: string;
  ingredients: string;
  productName: string;
  manufacturer: string;
  expirationDate: string;
  unmappedContent: string;
  manufacturingDate: string;
  marketResponsible: string;
  usageInstructions: string;
  notificationNumber: string;
};
