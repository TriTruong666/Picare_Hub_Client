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

export const USER_ROLES = [
  "admin",
  "ceo",
  "supply_chain",
  "hr",
  "qc",
  "ecom",
  "warehouse",
  "sales",
  "marketing",
  "business_development",
  "finance",
  "demo",
  "admin_brand",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  admin_brand: "Admin Brand",
  ceo: "CEO",
  supply_chain: "Supply Chain",
  hr: "HR",
  qc: "QC",
  ecom: "Ecom",
  warehouse: "Warehouse",
  sales: "Sales",
  marketing: "Marketing",
  business_development: "Business Development",
  finance: "Finance",
  demo: "Demo",
};

export const USER_ROLE_OPTIONS: Array<{ value: UserRole; label: string }> =
  USER_ROLES.map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  }));

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  role: UserRole;
};

export type UpdateUserPayload = {
  name: string;
  email: string;
  password?: string;
  phone?: string | null;
  role: UserRole;
};
