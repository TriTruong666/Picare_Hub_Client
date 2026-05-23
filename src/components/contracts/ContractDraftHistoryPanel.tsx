import { useMemo } from "react";
import { motion } from "framer-motion";
import { FiChevronRight, FiClock, FiFileText, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { formatDate, formatPrice } from "@/common/format";
import { PATHS } from "@/config/paths";
import { useContractList } from "@/hooks/data/useContractHooks";
import type { Contract } from "@/types/Contract";

function getEditPath(contractId: string) {
  return PATHS.CONTRACT_EDIT.replace(":contractId", contractId);
}

function getContractTotal(contract: Contract) {
  return contract.details.reduce((total, detail) => total + detail.price, 0);
}

export function ContractDraftHistoryPanel({
  activeContractId,
  isOpen,
  onClose,
}: {
  activeContractId?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const params = useMemo(
    () => ({ page: 1, limit: 20, search: "", status: "draft" as const }),
    [],
  );
  const { data: contracts = [], isLoading, isError } = useContractList(params);

  return (
    <motion.aside
      initial={false}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 360, damping: 34 }}
      className="fixed top-0 right-0 z-40 flex h-screen w-[min(390px,calc(100vw-3.5rem))] flex-col border-l border-white/10 bg-[#050505] text-white shadow-[-24px_0_60px_rgba(0,0,0,0.35)]"
      aria-hidden={!isOpen}
    >
      <div className="flex h-18 shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/60">
            <FiClock />
          </span>
          <div>
            <h2 className="text-sm font-medium text-white">
              Lịch sử hợp đồng nháp
            </h2>
            <p className="mt-1 text-xs text-white/40">
              Chọn bản nháp để chỉnh sửa.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center border border-white/10 text-white/45 transition hover:border-white/25 hover:text-white"
          aria-label="Đóng lịch sử hợp đồng"
        >
          <FiX />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-5 py-8 text-sm text-white/40">
            Đang tải danh sách hợp đồng...
          </div>
        ) : null}

        {isError ? (
          <div className="px-5 py-8 text-sm text-red-200/80">
            Không thể tải danh sách hợp đồng nháp.
          </div>
        ) : null}

        {!isLoading && !isError && contracts.length === 0 ? (
          <div className="px-5 py-8 text-sm text-white/35">
            Chưa có hợp đồng nháp nào.
          </div>
        ) : null}

        <div>
          {contracts.map((contract) => {
            const active = activeContractId === contract.contractId;

            return (
              <button
                key={contract.contractId}
                type="button"
                onClick={() => navigate(getEditPath(contract.contractId))}
                className={`group w-full border-b px-5 py-4 text-left transition ${
                  active
                    ? "border-white/15 bg-white/[0.06]"
                    : "border-white/10 hover:bg-white/[0.035]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border ${
                      active
                        ? "border-white/35 text-white"
                        : "border-white/10 text-white/45"
                    }`}
                  >
                    <FiFileText />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-sm font-medium text-white">
                        {contract.contractNumber || contract.contractId}
                      </p>
                      <FiChevronRight className="mt-0.5 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/55" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">
                      {contract.partnerCompanyInfo.companyName ||
                        "Chưa có tên đối tác"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40">
                      <span>{formatDate(contract.contractDueDate)}</span>
                      <span>{formatPrice(getContractTotal(contract))}</span>
                      <span>{contract.details.length} sản phẩm</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}
