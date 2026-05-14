import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
};

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Số trang hiển thị quanh trang hiện tại

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (
        (i === page - delta - 1 && i > 1) ||
        (i === page + delta + 1 && i < totalPages)
      ) {
        pages.push("...");
      }
    }

    return pages.filter((item, index) => {
      if (item === "..." && pages[index - 1] === "...") return false;
      return true;
    });
  };

  // Luôn hiển thị pagination để người dùng biết tổng số bản ghi ngay cả khi chỉ có 1 trang
  if (total === 0) return null;

  return (
    <div className="dark:border-border-dark flex items-center justify-between border border-gray-500 px-4 py-3">
      {/* Info */}
      <div className="flex items-center space-x-4">
        <span className="text-xs font-medium text-gray-800 dark:text-white dark:font-normal">
          Tổng {total} bản ghi
        </span>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 dark:font-normal">
          Trang <span className="font-bold">{page}</span> trên{" "}
          <span className="font-bold">{totalPages}</span>
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange?.(page - 1)}
          className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
            page === 1
              ? "dark:border-border-dark/40 cursor-not-allowed border-gray-500 text-gray-500 dark:text-gray-400"
              : "dark:border-border-dark border-gray-500 text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
          } `}
        >
          <HiOutlineChevronLeft className="text-sm" />
          Trước
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`dots-${idx}`}
                  className="px-1 text-xs font-medium text-gray-600"
                >
                  ...
                </span>
              );
            }

            const isCurrent = p === page;
            return (
              <button
                key={p}
                onClick={() => onPageChange?.(Number(p))}
                className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-bold transition ${
                  isCurrent
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "dark:border-border-dark border-gray-500 text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange?.(page + 1)}
          className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
            page === totalPages
              ? "dark:border-border-dark/40 cursor-not-allowed border-gray-500 text-gray-500 dark:text-gray-400"
              : "dark:border-border-dark border-gray-500 text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
          } `}
        >
          Sau
          <HiOutlineChevronRight className="text-sm" />
        </button>
      </div>
    </div>
  );
}
