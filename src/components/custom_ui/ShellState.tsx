import type { ReactNode } from "react";
import { Spinner } from "./Spinner";

type StateShellProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
};

export function StateShell({
  title,
  message,
  actionLabel,
  onAction,
  children,
}: StateShellProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-gray-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
        {message}
      </p>
      {children ? <div className="mt-5">{children}</div> : null}
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="btn-secondary mt-6">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function StateLoading() {
  return (
    <div className="flex h-10 items-center justify-center gap-2 border-t border-gray-200 px-4 text-[12px] text-gray-500 dark:border-white/10 dark:text-white/40">
      <Spinner size="sm" color="primary" />
      Đang tải...
    </div>
  );
}

export function StateLoadingContainer({ message = "Đang tải dữ liệu..." }: { message?: string }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center py-10">
      <Spinner size="lg" />
      <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
        {message}
      </p>
    </div>
  );
}

