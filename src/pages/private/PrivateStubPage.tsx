import { useLocation } from "react-router-dom";

export default function PrivateStubPage() {
  const location = useLocation();
  const title = location.pathname.split("/").filter(Boolean).slice(-1)[0] || "dashboard";

  return (
    <div className="page-layout">
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-8 dark:border-white/10 dark:bg-white/5">
        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Private Route
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          Trang này đang là placeholder để dropdown navbar có route thật. Bạn có thể
          thay nó bằng screen riêng sau.
        </p>
      </div>
    </div>
  );
}
