import { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown, FiSearch, FiTrash2 } from "react-icons/fi";

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import type { Contract } from "@/types/Contract";
import { formatContractDate } from "../../common/formatContractDate";
import type { AppendixProductRow } from "./appendixContractVariant";

function normalizeEditorText(html: string) {
  if (!html.trim()) return "";

  const withLineBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ");

  if (typeof window === "undefined") {
    return withLineBreaks.replace(/<[^>]+>/g, "").trim();
  }

  const element = document.createElement("div");
  element.innerHTML = withLineBreaks;
  return (element.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
}

export function AppendixProductEditor({
  product,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  product: AppendixProductRow;
  index: number;
  canRemove: boolean;
  onChange: (id: string, content: string) => void;
  onRemove: (id: string) => void;
}) {
  const handleChange = useCallback(
    ({ html }: { html: string }) => {
      onChange(product.id, normalizeEditorText(html));
    },
    [onChange, product.id],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-black/12 bg-white dark:border-white/10 dark:bg-white/2">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10">
        <p className="text-sm font-medium text-[#111111] dark:text-white">
          Sản phẩm {index + 1}
        </p>
        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(product.id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/12 text-black/60 transition hover:border-black/25 hover:text-[#111111] dark:border-white/10 dark:text-white/60 dark:hover:border-white/25 dark:hover:text-white"
            aria-label={`Xóa sản phẩm ${index + 1}`}
          >
            <FiTrash2 />
          </button>
        ) : null}
      </div>
      <SimpleEditor
        key={product.id}
        content={product.content}
        placeholder="Tên sản phẩm, thành phần, quy cách đóng gói, số đăng ký, nước sản xuất, đơn giá, phân loại..."
        showThemeToggle={false}
        wrapperClassName="min-h-[280px] bg-white dark:bg-[#050505]"
        contentClassName="min-h-[220px]"
        editorClassName="min-h-[220px]"
        onChange={handleChange}
      />
    </div>
  );
}

function getPersonalInfo(contract: Contract) {
  return (
    contract.personalInfo ??
    (contract.contractData && "personalInfo" in contract.contractData
      ? contract.contractData.personalInfo
      : null)
  );
}

export function PrincipleContractSelect({
  contracts,
  selectedContractId,
  isLoading,
  onChange,
  contractKind = "principle",
}: {
  contracts: Contract[];
  selectedContractId: string;
  isLoading: boolean;
  onChange: (contractId: string) => void;
  contractKind?: "principle" | "livestream";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedContract = contracts.find(
    (contract) =>
      contract.contractId === selectedContractId ||
      contract.contractNumber === selectedContractId,
  );
  const isEmpty = !isLoading && contracts.length === 0;
  const isLivestream = contractKind === "livestream";
  const getPartyName = (contract: Contract) => {
    const personal = getPersonalInfo(contract);
    return isLivestream
      ? personal?.fullName || "Chưa có tên người cam kết"
      : contract.partnerCompanyInfo.companyName ||
          contract.partnerCompanyInfo.ownerName;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative z-30">
      <button
        type="button"
        disabled={isLoading || isEmpty}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
          isOpen
            ? "border-black/30 bg-white shadow-[0_16px_35px_rgba(0,0,0,0.08)] dark:border-white/25 dark:bg-white/6"
            : "border-black/12 bg-white hover:border-black/22 dark:border-white/10 dark:bg-white/2 dark:hover:border-white/20"
        }`}
      >
        <span className="min-w-0">
          {selectedContract ? (
            <>
              <span className="block truncate text-sm font-semibold text-[#111111] dark:text-white">
                {selectedContract.contractNumber || selectedContract.contractId}
              </span>
              <span className="mt-1 block truncate text-xs text-black/52 dark:text-white/45">
                {getPartyName(selectedContract)}{" "}
                · {formatContractDate(selectedContract.createdAt) || "Chưa có ngày"}
              </span>
            </>
          ) : (
            <>
              <span className="block text-sm font-medium text-[#111111] dark:text-white">
                {isLoading
                  ? "Đang tải danh sách hợp đồng..."
                  : isEmpty
                    ? isLivestream
                      ? "Không có bản cam kết Livestream phù hợp"
                      : "Không có hợp đồng nguyên tắc phù hợp"
                    : isLivestream
                      ? "Chọn bản cam kết Livestream"
                      : "Chọn hợp đồng nguyên tắc"}
              </span>
              <span className="mt-1 block text-xs text-black/48 dark:text-white/38">
                {isLoading
                  ? "Đang lấy dữ liệu từ hệ thống, vui lòng chờ."
                  : isEmpty
                    ? "Cần có hợp đồng trạng thái phù hợp để tạo hoặc chỉnh sửa phụ lục."
                    : "Menu sẽ hiển thị số hợp đồng, trạng thái và thông tin đối tác."}
              </span>
            </>
          )}
        </span>
        <FiChevronDown
          className={`h-5 w-5 shrink-0 text-black/45 transition-transform duration-300 dark:text-white/45 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !isEmpty ? (
        <div className="absolute z-[120] mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#050505] text-white shadow-[0_24px_60px_rgba(0,0,0,0.46)]">
          <div className="max-h-80 overflow-y-auto p-2">
            {isLoading ? (
              <div className="space-y-2 p-1">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-3"
                  >
                    <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                    <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-white/8" />
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="h-3 animate-pulse rounded bg-white/8" />
                      <div className="h-3 animate-pulse rounded bg-white/8" />
                      <div className="h-3 animate-pulse rounded bg-white/8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/40">
                  <FiSearch />
                </div>
                <p className="text-sm font-medium text-white">
                  {isLivestream
                    ? "Không tìm thấy bản cam kết Livestream"
                    : "Không tìm thấy hợp đồng nguyên tắc"}
                </p>
                <p className="max-w-xs text-xs leading-6 text-white/45">
                  Danh sách hiện tại chưa có hợp đồng phù hợp để tạo phụ lục.
                </p>
              </div>
            ) : (
              contracts.map((contract) => {
                const active =
                  contract.contractId === selectedContractId ||
                  contract.contractNumber === selectedContractId;

                return (
                  <button
                    key={contract.contractId}
                    type="button"
                    onClick={() => {
                      onChange(contract.contractId);
                      setIsOpen(false);
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition-all duration-300 ${
                      active
                        ? "border-white/15 bg-white/[0.06]"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.045]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {contract.contractNumber || contract.contractId}
                          </p>
                        </div>
                        <p className="mt-1 truncate text-xs text-white/48">
                          {getPartyName(contract)}
                        </p>
                      </div>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                          active
                            ? "border-white/35 bg-white text-black"
                            : "border-white/12 text-transparent"
                        }`}
                      >
                        <FiCheck className="text-xs" />
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-white/42 sm:grid-cols-3">
                      <span>
                        Ngày tạo:{" "}
                        <strong className="font-semibold text-white">
                          {formatContractDate(contract.createdAt) || "Chưa có ngày"}
                        </strong>
                      </span>
                      <span>
                        {isLivestream ? "CCCD" : "MST"}:{" "}
                        <strong className="font-semibold text-white">
                          {isLivestream
                            ? getPersonalInfo(contract)?.citizenId || "Không có"
                            : contract.partnerCompanyInfo.mst || "Không có"}
                        </strong>
                      </span>
                      <span>
                        Trạng thái:{" "}
                        <strong className="font-semibold text-white">
                          {contract.status}
                        </strong>
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
