import { useMemo } from "react";
import { motion } from "framer-motion";
import { FiChevronRight, FiClock, FiFileText, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { formatDate } from "@/common/format";
import { PATHS } from "@/config/paths";
import { useContractList } from "@/hooks/data/useContractHooks";
import type { ContractStatus } from "@/types/Contract";

function getEditPath(contractId: string) {
  return PATHS.CONTRACT_EDIT.replace(":contractId", contractId);
}

function getPreviewPath(contractId: string) {
  return PATHS.CONTRACT_PREVIEW.replace(":contractId", contractId);
}

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "Bản nháp",
  unsigned: "Chờ ký",
  owner_signed: "Chủ sở hữu đã ký",
  completed: "Hoàn tất",
};

const CONTRACT_STATUS_STYLES: Record<ContractStatus, string> = {
  draft: "border-white/15 bg-white/8 text-white/75",
  unsigned: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  owner_signed: "border-indigo-300/25 bg-indigo-400/10 text-indigo-100",
  completed: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
};

function getContractDestination(contractId: string, status: ContractStatus) {
  return status === "draft"
    ? getEditPath(contractId)
    : getPreviewPath(contractId);
}

export function ContractHistoryPanel({
  activeContractId,
  isOpen,
  onClose,
}: {
  activeContractId?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const params = useMemo(() => ({ page: 1, limit: 20, search: "" }), []);
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
            <h2 className="text-sm font-medium text-white">Lịch sử hợp đồng</h2>
            <p className="mt-1 text-xs text-white/40">
              Theo dõi tất cả trạng thái hợp đồng.
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
            Không thể tải danh sách hợp đồng.
          </div>
        ) : null}

        {!isLoading && !isError && contracts?.length === 0 ? (
          <div className="px-5 py-8 text-sm text-white/35">
            Chưa có hợp đồng nào.
          </div>
        ) : null}

        <div>
          {contracts?.map((contract) => {
            const active = activeContractId === contract.contractId;
            const isLivestream =
              contract.contractType === "livestream_responsibility_commitment" ||
              contract.contractType === "livestream_responsibility_commitment_appendix";

            const personal =
              contract.personalInfo ??
              (contract.contractData && "personalInfo" in contract.contractData
                ? contract.contractData.personalInfo
                : null);

            const partnerName = isLivestream
              ? personal?.fullName || "Chưa có tên người cam kết"
              : contract.partnerCompanyInfo?.companyName || "Chưa có tên đối tác";

            const ownerName = isLivestream
              ? personal?.fullName || "Chưa có người cam kết"
              : contract.partnerCompanyInfo?.ownerName || "Chưa có người đại diện";

            const roleOrPosition = isLivestream
              ? personal?.position
              : contract.partnerCompanyInfo?.role;

            const taxOrIdLabel = isLivestream ? "CCCD" : "MST";
            const taxOrIdVal = isLivestream
              ? personal?.citizenId
              : contract.partnerCompanyInfo?.mst;

            const phone = isLivestream ? null : contract.partnerCompanyInfo?.phone;
            const email = isLivestream ? null : contract.partnerCompanyInfo?.email;

            return (
              <button
                key={contract.contractId}
                type="button"
                onClick={() =>
                  navigate(
                    getContractDestination(
                      contract.contractId,
                      contract.status,
                    ),
                  )
                }
                className={`group w-full border-b px-5 py-4 text-left transition ${
                  active
                    ? "border-white/15 bg-white/6"
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
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {contract.contractNumber || contract.contractId}
                        </p>
                        <span
                          className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-wide uppercase ${
                            CONTRACT_STATUS_STYLES[contract.status]
                          }`}
                        >
                          {CONTRACT_STATUS_LABELS[contract.status]}
                        </span>
                      </div>
                      <FiChevronRight className="mt-0.5 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-white/55" />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/45">
                      {partnerName}
                    </p>

                    <div className="mt-3 space-y-1.5 text-xs leading-5 text-white/40">
                      <p className="truncate">
                        {ownerName}
                        {roleOrPosition ? ` · ${roleOrPosition}` : ""}
                      </p>
                      <p className="truncate">
                        {taxOrIdLabel}: {taxOrIdVal || "N/A"}
                      </p>
                      {!isLivestream && (
                        <p className="truncate">
                          {phone || "Chưa có SĐT"} · {email || "Chưa có email"}
                        </p>
                      )}
                      <p>Hết hạn: {formatDate(contract.contractDueDate ?? "")}</p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 border-t border-white/10 p-4">
        <button
          type="button"
          onClick={() => navigate(PATHS.CONTRACT_CREATE)}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-black transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-white/95 active:translate-y-0 active:scale-[0.98]"
        >
          Tạo hợp đồng
        </button>
      </div>
    </motion.aside>
  );
}
