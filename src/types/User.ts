export type User = {
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  isOnline: boolean;
  note?: string | null;
  role: UserRole;
  createdAt: string;
};

type UserRole =
  | "admin"
  | "ecom_staff"
  | "ecom_lead"
  | "warehouse"
  | "sale_lead"
  | "sale_staff"
  | "marketing"
  | "business_development"
  | "finance"
  | "demo";

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  role: UserRole;
};
