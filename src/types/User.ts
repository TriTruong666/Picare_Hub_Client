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
  "ecom_staff",
  "ecom_lead",
  "warehouse",
  "sale_lead",
  "sale_staff",
  "marketing",
  "business_development",
  "finance",
  "demo",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_OPTIONS: Array<{ value: UserRole; label: string }> =
  USER_ROLES.map((role) => ({
    value: role,
    label: role,
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
