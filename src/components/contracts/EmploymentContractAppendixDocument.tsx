import { motion } from "framer-motion";
import type { Ref } from "react";
import type {
  Contract,
  EmploymentContractAppendixDataPayload,
} from "@/types/Contract";
import {
  ContractHeader,
  PartyRow,
  SignatureArea,
} from "./EmploymentContractShared";
import {
  formatDate,
  formatLongDate,
  formatMoney,
} from "./employmentContractFormatters";

function getAppendixData(contract: Contract) {
  const data = contract.contractData;
  if (
    !data ||
    !("employmentContractNumber" in data) ||
    !("personalInfo" in data)
  ) {
    return null;
  }
  return data as EmploymentContractAppendixDataPayload;
}

export function EmploymentContractAppendixDocument({
  contract,
  ownerSignatureRef,
  partnerSignatureRef,
  ownerSignatureRevealKey,
  partnerSignatureRevealKey,
  appearance = "internal",
}: {
  contract: Contract;
  ownerSignatureRef?: Ref<HTMLDivElement>;
  partnerSignatureRef?: Ref<HTMLDivElement>;
  ownerSignatureRevealKey?: number;
  partnerSignatureRevealKey?: number;
  appearance?: "internal" | "public";
}) {
  const data = getAppendixData(contract);
  if (!data) {
    return (
      <article className="mx-auto w-full max-w-5xl p-10 text-black dark:text-white">
        Không tìm thấy dữ liệu phụ lục hợp đồng lao động.
      </article>
    );
  }

  const owner = contract.ownerCompanyInfo;
  const person = data.personalInfo;
  const longDate = formatLongDate(data.contractDate);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={
        "mx-auto w-full max-w-5xl pb-24 text-[14px] leading-7 text-black/62 dark:text-white/62 " +
        (appearance === "public" ? "dark" : "")
      }
    >
      <ContractHeader
        companyName={owner.companyName}
        contractNumber={contract.contractNumber}
        contractDate={longDate}
      />

      <section className="mt-10 text-center">
        <h1 className="text-3xl font-medium tracking-[0.03em] text-[#111111] uppercase dark:text-white">
          Phụ lục hợp đồng lao động
        </h1>
      </section>

      <p className="mt-8">
        Hôm nay, {longDate}, tại văn phòng {owner.companyName}, chúng tôi gồm
        các bên sau đây:
      </p>

      <section className="mt-6">
        <h2 className="text-[13px] font-medium tracking-[0.12em] text-black/80 uppercase dark:text-white/80">
          Bên A (Người sử dụng lao động)
        </h2>
        <dl className="mt-2">
          <PartyRow label="Công ty" value={owner.companyName} />
          <PartyRow label="Trụ sở chính" value={owner.address} />
          <PartyRow label="Mã số thuế" value={owner.mst} />
          <PartyRow label="Đại diện bởi" value={owner.ownerName} />
          <PartyRow label="Chức vụ" value={owner.role} />
          <PartyRow label="Điện thoại" value={owner.phone} />
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="text-[13px] font-medium tracking-[0.12em] text-black/80 uppercase dark:text-white/80">
          Bên B (Người lao động)
        </h2>
        <dl className="mt-2">
          <PartyRow label="Họ và tên" value={person.fullName} />
          <PartyRow
            label="Ngày sinh / Giới tính"
            value={
              formatDate(person.dateOfBirth) + " / " + (person.gender || "-")
            }
          />
          <PartyRow
            label="CCCD / Ngày cấp"
            value={
              (person.citizenId || "-") +
              " / " +
              formatDate(person.citizenIdIssuedDate)
            }
          />
          <PartyRow label="Nơi cấp" value={person.citizenIdIssuedPlace} />
          <PartyRow label="Nơi thường trú" value={person.permanentAddress} />
          <PartyRow label="Nơi đang sinh sống" value={person.currentAddress} />
          <PartyRow label="Mã số thuế" value={person.taxCode} />
          <PartyRow label="Mã số BHXH" value={person.socialInsuranceNumber} />
          <PartyRow label="Liên hệ khẩn cấp" value={person.emergencyContact} />
        </dl>
      </section>

      <p className="mt-6 text-justify">
        Căn cứ Hợp đồng lao động số {data.employmentContractNumber} ký{" "}
        {longDate} và nhu cầu sử dụng lao động, hai bên cùng nhau thỏa thuận
        thay đổi một số nội dung của hợp đồng đã ký như sau:
      </p>

      <section className="mt-8">
        <h2 className="text-[13px] font-medium tracking-[0.12em] text-black/80 uppercase dark:text-white/80">
          Điều 1: Nội dung thay đổi
        </h2>
        <h3 className="mt-3 font-semibold text-black/86 dark:text-white/86">
          1.1. Tiền lương, chế độ, phúc lợi, thưởng
        </h3>
        <div className="mt-4 overflow-hidden rounded-lg border border-black/15 dark:border-white/15">
          {[
            ["Mức lương cơ bản", data.baseSalary],
            ["Tiền ăn giữa ca", data.mealAllowance],
            ["Hỗ trợ điện thoại + đồng phục", data.phoneUniformAllowance],
            ["Thưởng hiệu quả công việc", data.performanceBonus],
            ["Hỗ trợ xăng xe", data.transportationAllowance],
            ["Tổng cộng", data.totalSalary],
          ].map(([label, value], index) => (
            <div
              key={String(label)}
              className={
                "grid grid-cols-[1fr_180px] border-b border-black/10 px-4 py-2 last:border-0 dark:border-white/10 " +
                (index === 5 ? "font-semibold" : "")
              }
            >
              <span>{label}</span>
              <span className="text-right">{formatMoney(value)} đồng</span>
            </div>
          ))}
        </div>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-justify">
          <li>
            Lương làm thêm giờ: Được tính theo quy định của pháp luật lao động
            và quy định của Công ty.
          </li>
          <li>
            Lương tháng 13: Người lao động được hưởng tháng lương 13 và các
            khoản tương đương lương khác (nếu có) tùy theo hiệu quả công việc và
            kết quả kinh doanh của Công ty trong năm.
          </li>
          <li>
            BHXH, BHYT, BHTN: Theo quy định của Luật BHXH hiện hành về mức tham
            gia đóng và tỷ lệ đóng BHXH, BHYT, BHTN cho người lao động.
          </li>
          <li>
            Thuế TNCN phát sinh dựa trên tổng thu nhập hàng tháng của người lao
            động (nếu có) sẽ do người lao động chi trả và Công ty khấu trừ vào
            lương để trích nộp theo quy định.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-[13px] font-medium tracking-[0.12em] text-black/80 uppercase dark:text-white/80">
          Điều 2: Thời gian thực hiện
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-justify">
          <li>
            Phụ lục hợp đồng có hiệu lực kể từ ngày ký cho đến khi Hợp đồng lao
            động đã ký kết hết hạn.
          </li>
          <li>
            Phụ lục này là bộ phận không thể tách rời của Hợp đồng lao động số{" "}
            {data.employmentContractNumber}, được làm thành hai bản có giá trị
            như nhau, mỗi bên giữ một bản và là cơ sở giải quyết khi có tranh
            chấp lao động.
          </li>
          <li>
            Phụ lục Hợp đồng này được lập tại {owner.companyName}, {longDate}.
          </li>
        </ul>
      </section>

      <SignatureArea
        contract={contract}
        employeeName={person.fullName}
        ownerSignatureRef={ownerSignatureRef}
        partnerSignatureRef={partnerSignatureRef}
        ownerSignatureRevealKey={ownerSignatureRevealKey}
        partnerSignatureRevealKey={partnerSignatureRevealKey}
      />

      <p className="mt-10 text-center text-xs text-black/45 dark:text-white/35">
        Phụ lục hợp đồng lao động độc lập · Điều 1–2
      </p>
    </motion.article>
  );
}
