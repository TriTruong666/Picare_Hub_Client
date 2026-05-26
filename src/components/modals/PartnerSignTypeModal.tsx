import { AnimatePresence, motion } from "framer-motion";
import { FiBriefcase, FiUser } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

export type PartnerSignType = "individual" | "organization";

type OptionCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  badgeColor: "indigo" | "emerald";
  selected: boolean;
  onClick: () => void;
};

function OptionCard({
  icon,
  title,
  description,
  badge,
  badgeColor,
  selected,
  onClick,
}: OptionCardProps) {
  const badgeClasses =
    badgeColor === "indigo"
      ? "bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-500/20"
      : "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20";

  const cardClasses = selected
    ? "border-white/30 bg-white/[0.07]"
    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.055]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex h-full w-full flex-col rounded-xl border p-5 text-left transition-all duration-200 ${cardClasses}`}
    >
      <motion.div
        initial={false}
        animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.85 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-white"
      >
        <div className="h-2 w-2 rounded-full bg-black" />
      </motion.div>

      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl transition-colors duration-200 ${
            selected
              ? "border-white/20 bg-white/10 text-white"
              : "border-white/10 bg-white/[0.05] text-white/60 group-hover:border-white/15 group-hover:text-white/80"
          }`}
        >
          {icon}
        </div>

        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${badgeClasses}`}
        >
          {badge}
        </span>
      </div>

      <div className="mt-4 space-y-1.5">
        <p
          className={`text-[15px] leading-snug font-semibold transition-colors duration-200 ${
            selected ? "text-white" : "text-white/75 group-hover:text-white/90"
          }`}
        >
          {title}
        </p>
        <p className="text-[13px] leading-5 text-white/40">{description}</p>
      </div>
    </button>
  );
}

type PartnerSignTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: PartnerSignType) => void;
};

export default function PartnerSignTypeModal({
  isOpen,
  onClose,
  onConfirm,
}: PartnerSignTypeModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.12 }}
            className="dashboard-theme relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-5 border-b border-white/10 bg-white/[0.04] px-6 py-5">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-white">
                  Chọn hình thức ký
                </h2>
                <p className="text-xs leading-5 text-white/45">
                  Chọn đúng loại đại diện để hệ thống mở đúng luồng xác thực.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid gap-3 md:grid-cols-2">
                <OptionCard
                  icon={<FiUser />}
                  title="Cá nhân"
                  description="Đại diện cá nhân, xác nhận hợp đồng bằng chữ ký tay được số hóa trên thiết bị."
                  badge="Ký tay"
                  badgeColor="indigo"
                  selected={false}
                  onClick={() => onConfirm("individual")}
                />
                <OptionCard
                  icon={<FiBriefcase />}
                  title="Tổ chức"
                  description="Đại diện pháp nhân doanh nghiệp, xác nhận hợp đồng bằng chữ ký số USB Token."
                  badge="Ký số"
                  badgeColor="emerald"
                  selected={false}
                  onClick={() => onConfirm("organization")}
                />
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
