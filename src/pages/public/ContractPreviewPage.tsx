import { useState } from "react";
import { motion } from "framer-motion";
import { FiEdit3, FiPenTool } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { Spinner } from "@/components/custom_ui/Spinner";
import { Tooltip } from "@/components/custom_ui/Tooltip";
import ContractSigningModal from "@/components/modals/ContractSigningModal";
import { PATHS } from "@/config/paths";
import { useContractDetail } from "@/hooks/data/useContractHooks";
import type {
  Contract,
  ContractDetail,
  OwnerCompanyInfoPayload,
  PartnerCompanyInfoPayload,
} from "@/types/Contract";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function getEditPath(contractId: string) {
  return PATHS.CONTRACT_EDIT.replace(":contractId", contractId);
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    const [year, month, day] = value.split("-");
    return [day, month, year].filter(Boolean).join("/");
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getVietnameseDate(value?: string) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "ngày ... tháng ... năm ...";
  }

  return `ngày ${String(date.getDate()).padStart(2, "0")} tháng ${String(
    date.getMonth() + 1,
  ).padStart(2, "0")} năm ${date.getFullYear()}`;
}

function ArticleTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 text-[13px] font-medium tracking-[0.12em] text-white/80 uppercase">
      {children}
    </h2>
  );
}

function FieldLine({ label, value }: { label: string; value?: string }) {
  return (
    <p className="text-[14px] leading-7 text-white/62">
      <span className="mr-2 text-white/35">{label}:</span>
      <span className="text-white/82">{value || "-"}</span>
    </p>
  );
}

function PartySection({
  title,
  party,
}: {
  title: string;
  party: OwnerCompanyInfoPayload | PartnerCompanyInfoPayload;
}) {
  return (
    <section className="mt-8">
      <h3 className="text-[15px] font-medium text-white uppercase">{title}</h3>
      <div className="mt-3 space-y-1">
        <FieldLine label="Tên công ty" value={party.companyName} />
        <FieldLine label="Địa chỉ" value={party.address} />
        <FieldLine label="Điện thoại" value={party.phone} />
        <FieldLine label="Email" value={party.email} />
        <FieldLine label="Tài khoản" value={party.bankInfo} />
        <FieldLine label="Mã số thuế" value={party.mst} />
        <FieldLine label="Đại diện" value={party.ownerName} />
        <FieldLine label="Chức vụ" value={party.role} />
      </div>
    </section>
  );
}

function ClauseList({ items }: { items: string[] }) {
  return (
    <div className="mt-4 space-y-2">
      {items.map((item) => (
        <p key={item} className="text-[14px] leading-7 text-white/62">
          {item}
        </p>
      ))}
    </div>
  );
}

function ProductList({ details }: { details: ContractDetail[] }) {
  return (
    <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
      <div className="grid grid-cols-[42px_1fr_130px] gap-4 py-3 text-[11px] tracking-[0.12em] text-white/35 uppercase">
        <span>STT</span>
        <span>Sản phẩm</span>
        <span className="text-right">Giá</span>
      </div>
      {details.map((item, index) => (
        <div
          key={item.contractDetailId || item.productName}
          className="grid grid-cols-[42px_1fr_130px] gap-4 py-4 text-[14px]"
        >
          <span className="text-white/35">{index + 1}</span>
          <span className="text-white/82">{item.productName}</span>
          <span className="text-right text-white/62 tabular-nums">
            {formatCurrency(item.price)}
          </span>
        </div>
      ))}
    </div>
  );
}

function SignatureBlock({ title, name }: { title: string; name: string }) {
  return (
    <div className="text-center">
      <p className="text-[13px] font-medium tracking-[0.08em] text-white/80 uppercase">
        {title}
      </p>
      <p className="mt-2 text-[12px] text-white/35">
        Ký, đóng dấu, ghi rõ họ và tên
      </p>
      <div className="h-32" />
      <p className="text-[14px] font-medium text-white uppercase">{name}</p>
    </div>
  );
}

function ContractDocument({ contract }: { contract: Contract }) {
  const owner = contract.ownerCompanyInfo;
  const partner = contract.partnerCompanyInfo;
  const signedDate = getVietnameseDate(contract.createdAt);
  const dueDate = formatDate(contract.contractDueDate);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="mx-auto w-full max-w-3xl pb-24"
    >
      <header className="grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="text-[13px] font-medium tracking-[0.08em] text-white/80 uppercase">
            {owner.companyName}
          </p>
          <p className="mt-3 text-[13px] text-white/35">
            Số: {contract.contractNumber}
          </p>
        </div>
        <div className="text-left md:text-center">
          <p className="text-[13px] font-medium tracking-[0.08em] text-white/80 uppercase">
            Cộng hòa xã hội chủ nghĩa Việt Nam
          </p>
          <p className="mt-1 text-[13px] text-white/62">
            Độc lập - Tự do - Hạnh phúc
          </p>
        </div>
      </header>

      <section className="pt-14 text-center">
        <p className="text-[13px] text-white/35">Hôm nay, {signedDate}</p>
        <h1 className="mt-7 text-4xl font-medium tracking-[0.03em] text-white uppercase">
          Hợp đồng nguyên tắc
        </h1>
        <p className="mt-3 text-[15px] text-white/62">
          Số {contract.contractNumber}
        </p>
        <p className="mt-1 text-[13px] text-white/35">Về việc: Bán hàng</p>
      </section>

      <section className="mt-14">
        <ArticleTitle>Căn cứ ký kết</ArticleTitle>
        <ClauseList
          items={[
            "Căn cứ Bộ Luật Dân sự và các quy định pháp luật hiện hành của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.",
            "Căn cứ Luật Thương mại và nhu cầu giao dịch hàng hóa giữa hai bên.",
            "Căn cứ vào khả năng cung ứng của Bên A và nhu cầu mua hàng của Bên B.",
          ]}
        />
      </section>

      <p className="mt-10 text-[14px] leading-7 text-white/62">
        Hôm nay tại văn phòng công ty, hai bên gồm có các đại diện dưới đây cùng
        thống nhất ký hợp đồng nguyên tắc bán hàng theo các điều khoản trong văn
        bản này.
      </p>

      <PartySection title="Bên bán (Bên A)" party={owner} />
      <PartySection title="Bên mua (Bên B)" party={partner} />

      <section>
        <ArticleTitle>Điều 1: Nguyên tắc mua bán</ArticleTitle>
        <p className="text-[14px] leading-7 text-white/62">
          Bên A đồng ý bán cho Bên B các sản phẩm do Bên A đăng ký, sản xuất
          hoặc phân phối. Danh mục sản phẩm và giá trị được xác nhận như sau:
        </p>
        <ProductList details={contract.details ?? []} />
        <ClauseList
          items={[
            "Số lượng sản phẩm được quy định chi tiết tại từng đơn đặt hàng của Bên B.",
            "Số lượng hàng giao cho phép dao động trong phạm vi hai bên thống nhất tại từng thời điểm.",
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 2: Quy cách, chất lượng hàng hóa</ArticleTitle>
        <ClauseList
          items={[
            "Quy cách và chất lượng hàng hóa tuân thủ theo tiêu chuẩn đã được công bố hoặc đăng ký với cơ quan có thẩm quyền.",
            "Bên B chịu trách nhiệm bảo quản và tiêu thụ sản phẩm đúng quy định pháp luật.",
            "Bên A chịu trách nhiệm về chất lượng sản phẩm theo phạm vi cam kết và quy chế hiện hành.",
          ]}
        />
      </section>

      <section>
        <ArticleTitle>
          Điều 3: Trách nhiệm và quyền lợi của các bên
        </ArticleTitle>
        <p className="mt-4 text-[14px] font-medium text-white/82">
          1. Trách nhiệm của Bên A
        </p>
        <ClauseList
          items={[
            "Cung cấp hàng theo đúng số lượng, chủng loại và tiêu chuẩn đã xác nhận.",
            "Giao hàng trong thời hạn hai bên thống nhất tại từng đơn đặt hàng.",
            "Phối hợp xử lý các trường hợp hàng hóa hư hỏng do lỗi sản xuất theo quy định.",
          ]}
        />
        <p className="mt-7 text-[14px] font-medium text-white/82">
          2. Trách nhiệm của Bên B
        </p>
        <ClauseList
          items={[
            "Gửi đơn đặt hàng trước thời điểm cần nhận hàng theo thời gian hai bên thống nhất.",
            "Kinh doanh sản phẩm theo đúng quy định của pháp luật hiện hành.",
            "Thanh toán đầy đủ và đúng thời hạn theo điều khoản thanh toán của hợp đồng.",
            "Mọi khiếu nại về hàng hóa cần được lập thành văn bản và gửi trong thời hạn quy định.",
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 4: Khiếu nại và giải quyết khiếu nại</ArticleTitle>
        <ClauseList
          items={[
            "Bên B có trách nhiệm kiểm tra số lượng, quy cách và chất lượng hàng hóa khi giao nhận.",
            "Khi có sai lệch, Bên B phải thông báo bằng văn bản cho Bên A trong thời hạn phù hợp.",
            "Trong thời gian xử lý tranh chấp, Bên B có trách nhiệm bảo quản hàng hóa theo đúng điều kiện quy định.",
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 5: Giá cả và phương thức thanh toán</ArticleTitle>
        <ClauseList
          items={[
            "Giá bán được thể hiện trong hợp đồng, phụ lục, bảng giá hoặc từng đơn đặt hàng đã được hai bên xác nhận.",
            "Thanh toán bằng chuyển khoản theo thời hạn và thông tin tài khoản do Bên A cung cấp.",
            "Các trường hợp đặc biệt khác phải có thỏa thuận bằng văn bản của hai bên.",
          ]}
        />
      </section>

      <section>
        <ArticleTitle>Điều 6: Điều khoản chung</ArticleTitle>
        <ClauseList
          items={[
            "Hai bên cam kết thực hiện đúng nội dung của hợp đồng nguyên tắc này.",
            "Trường hợp phát sinh tranh chấp, hai bên ưu tiên giải quyết bằng thương lượng.",
            "Nếu không thể giải quyết bằng thương lượng, tranh chấp sẽ được đưa ra cơ quan có thẩm quyền theo quy định pháp luật.",
          ]}
        />
        <p className="mt-8 text-[14px] leading-7 text-white/62">
          Hợp đồng có hiệu lực kể từ ngày ký đến ngày {dueDate || "..."}. Sau
          thời hạn trên, hợp đồng có thể được ký lại hoặc gia hạn nếu được hai
          bên cùng thống nhất.
        </p>
      </section>

      <section className="mt-20 grid gap-12 border-t border-white/10 pt-12 md:grid-cols-2">
        <SignatureBlock title="Đại diện Bên A" name={owner.ownerName} />
        <SignatureBlock title="Đại diện Bên B" name={partner.ownerName} />
      </section>
    </motion.article>
  );
}

function DockButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip content={label}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="group flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.07] text-white/70 transition duration-250 ease-out hover:-translate-y-0.5 hover:bg-white hover:text-black active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        aria-label={label}
      >
        <span className="text-[18px] transition duration-250 ease-out group-hover:scale-105">
          {icon}
        </span>
      </button>
    </Tooltip>
  );
}

function ContractActionDock({ contract }: { contract: Contract }) {
  const navigate = useNavigate();
  const [signingContract, setSigningContract] = useState<Contract | null>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#0b0b0b]/90 p-2 shadow-[0_22px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      >
        <DockButton
          label="Ký hợp đồng"
          icon={<FiPenTool />}
          onClick={() => setSigningContract(contract)}
        />
        {contract.status === "draft" ? (
          <DockButton
            label="Chỉnh sửa hợp đồng"
            icon={<FiEdit3 />}
            onClick={() => navigate(getEditPath(contract.contractId))}
          />
        ) : null}
      </motion.div>

      <ContractSigningModal
        contract={signingContract}
        onClose={() => setSigningContract(null)}
      />
    </>
  );
}

export default function ContractPreviewPage() {
  const { contractId = "" } = useParams();
  const {
    data: contract,
    isLoading,
    isError,
    refetch,
  } = useContractDetail(contractId);

  if (isLoading) {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="white" />
          <p className="text-sm text-white/45">Đang tải hợp đồng...</p>
        </div>
      </main>
    );
  }

  if (isError || !contract) {
    return (
      <main className="dashboard-theme flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-medium">Không tải được hợp đồng</h1>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Vui lòng kiểm tra lại mã hợp đồng hoặc thử tải lại trang.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-lg border border-white/15 px-5 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Tải lại
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-theme min-h-screen bg-black px-5 py-10 text-white md:px-8">
      <ContractDocument contract={contract} />
      <ContractActionDock contract={contract} />
    </main>
  );
}
