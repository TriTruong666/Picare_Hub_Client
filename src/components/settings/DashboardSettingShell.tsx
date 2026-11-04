import type { ReactNode } from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";
type SettingCardProps = {
  label: string;
  description: string;
  children: ReactNode;
  helper?: ReactNode;
  info?: ReactNode;
  buttonTitle?: string;
  onSubmit?: () => void | Promise<void>;
  disabled?: boolean;
};

export function SettingCard({
  label,
  description,
  children,
  helper,
  info,
  buttonTitle = "Lưu thay đổi",
  onSubmit,
  disabled = false,
}: SettingCardProps) {
  return (
    <section className="setting-card">
      <div className="setting-card-main">
        <div className="flex flex-col gap-3">
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">
            {label}
          </h1>
          <p className="text-[13px] text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
        {children}
        {info && (
          <div className="dark:border-border-dark flex gap-3 rounded-lg border border-gray-300 px-4 py-3 text-gray-600 dark:text-white/70">
            <IoIosInformationCircleOutline className="mt-0.5 shrink-0" />
            {info}
          </div>
        )}
      </div>
      {(helper || onSubmit) && (
        <footer className="flex items-center justify-between gap-4 px-6 py-4">
          <div>{helper}</div>
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={disabled}
              className="btn-primary"
            >
              {buttonTitle}
            </button>
          )}
        </footer>
      )}
    </section>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="w-full space-y-6 px-6 py-4 xl:px-12">{children}</div>;
}
