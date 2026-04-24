export type User = {
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  isOnline: boolean;
  note?: string | null;
  role:
    | "admin"
    | "ecom_staff"
    | "ecom_lead"
    | "warehouse"
    | "logistics"
    | "default";
  createdAt: string;
};
