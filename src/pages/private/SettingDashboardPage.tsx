import { useState } from "react";

import { useChangePassword } from "@/hooks/data/useAuthHooks";
import { useUpdateUserInfo } from "@/hooks/data/useUserHooks";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/useToast";

import { SettingCard, Page } from "@/components/settings/DashboardSettingShell";

export function ProfileSettingDashboardPage() {
  const { user } = useAuth();
  const updateProfile = useUpdateUserInfo();
  const [form, setForm] = useState<{
    name: string | null;
    phone: string | null;
  }>({ name: null, phone: null });
  const name = form.name ?? user?.name ?? "";
  const phone = form.phone ?? user?.phone ?? "";

  return (
    <Page>
      <SettingCard
        label="Thông tin cơ bản"
        description="Bạn có thể cập nhật tên và số điện thoại của bạn"
        buttonTitle={updateProfile.isPending ? "Đang cập nhật…" : "Cập nhật"}
        disabled={updateProfile.isPending}
        onSubmit={() => {
          if (!user?.userId) return;
          updateProfile.mutate({
            userId: user.userId,
            data: { name: name.trim(), phone: phone.trim() },
          });
        }}
        helper={
          <span className="helper-setting-card">
            Chỉ được thay đổi 1 lần / tuần
          </span>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={user?.email || ""}
              aria-label="Email"
              className="input-primary"
              readOnly
              disabled
            />
            <input
              value={phone}
              aria-label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              className="input-primary"
              onChange={(event) =>
                setForm((value) => ({ ...value, phone: event.target.value }))
              }
            />
          </div>
          <input
            value={name}
            aria-label="Tên của bạn"
            placeholder="Tên của bạn"
            className="input-primary"
            onChange={(event) =>
              setForm((value) => ({ ...value, name: event.target.value }))
            }
          />
        </form>
      </SettingCard>
    </Page>
  );
}

export function SecuritySettingDashboardPage() {
  const changePassword = useChangePassword();
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Thiếu thông tin", "Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Xác nhận chưa đúng", "Mật khẩu xác nhận không khớp.");
      return;
    }

    const response = await changePassword.mutateAsync({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    });
    if (response.success) {
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  return (
    <Page>
      <SettingCard
        label="Mật khẩu"
        description="Cập nhật mật khẩu để bảo vệ tài khoản của bạn"
        buttonTitle={changePassword.isPending ? "Đang đổi…" : "Đổi mật khẩu"}
        onSubmit={handleSubmit}
        disabled={changePassword.isPending}
        helper={
          <span className="helper-setting-card">
            Bạn có thể đổi mật khẩu 1 tháng / lần
          </span>
        }
      >
        <form
          className="flex max-w-3xl flex-col gap-4"
          onSubmit={(event) => event.preventDefault()}
        >
          {(
            [
              ["oldPassword", "Mật khẩu hiện tại"],
              ["newPassword", "Mật khẩu mới"],
              ["confirmPassword", "Xác nhận mật khẩu mới"],
            ] as const
          ).map(([key, placeholder]) => (
            <input
              key={key}
              type="password"
              value={form[key]}
              aria-label={placeholder}
              placeholder={placeholder}
              className="input-primary"
              onChange={(event) =>
                setForm((value) => ({ ...value, [key]: event.target.value }))
              }
            />
          ))}
        </form>
      </SettingCard>
    </Page>
  );
}
