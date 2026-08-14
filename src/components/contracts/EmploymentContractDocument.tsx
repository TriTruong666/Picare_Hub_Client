import type { Ref } from "react";
import type { Contract, EmploymentContractDataPayload } from "@/types/Contract";

type SignatureProps = {
  title: string;
  subtitle: string;
  name: string;
  signed: boolean;
  signatureRef?: Ref<HTMLDivElement>;
};

function formatDate(value?: string | null) {
  if (!value) return ".../.../...";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatLongDate(value?: string | null) {
  const [day, month, year] = formatDate(value).split("/");
  return `ngày ${day} tháng ${month} năm ${year}`;
}

function formatMoney(value: number | string | null | undefined) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return String(value || "0");
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(numberValue);
}

function getEmploymentData(contract: Contract) {
  const data = contract.contractData;
  if (!data || !("contractDate" in data) || !("personalInfo" in data)) {
    return null;
  }
  return data as EmploymentContractDataPayload;
}

function ContractHeader({
  companyName,
  contractNumber,
  contractDate,
}: {
  companyName: string;
  contractNumber: string;
  contractDate: string;
}) {
  return (
    <header className="grid grid-cols-1 gap-8 text-center sm:grid-cols-2">
      <div>
        <p className="font-semibold uppercase">{companyName}</p>
        <p className="mt-2">Số: {contractNumber}</p>
      </div>
      <div>
        <p className="font-semibold uppercase">
          Cộng hòa xã hội chủ nghĩa Việt Nam
        </p>
        <p className="mt-1 font-semibold">Độc lập - Tự do - Hạnh phúc</p>
        <p className="mt-1">----------- oOo ----------</p>
        <p className="mt-3 italic">TP. Hồ Chí Minh, {contractDate}</p>
      </div>
    </header>
  );
}

function PartyRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-[170px_1fr] gap-3 border-b border-black/10 py-1.5 last:border-0">
      <dt className="font-medium">{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

function Signature({
  title,
  subtitle,
  name,
  signed,
  signatureRef,
}: SignatureProps) {
  return (
    <div ref={signatureRef} className="text-center">
      <p className="font-semibold uppercase">{title}</p>
      <p className="mt-1 italic">{subtitle}</p>
      <div className="mx-auto mt-4 flex h-24 max-w-[220px] items-center justify-center rounded border border-dashed border-black/30 text-xs font-semibold text-emerald-700">
        {signed ? "ĐÃ KÝ TRÊN HỆ THỐNG" : "CHỜ KÝ"}
      </div>
      <p className="mt-3 font-semibold uppercase">{name}</p>
    </div>
  );
}

function SignatureArea({
  contract,
  employeeName,
  ownerSignatureRef,
  partnerSignatureRef,
}: {
  contract: Contract;
  employeeName: string;
  ownerSignatureRef?: Ref<HTMLDivElement>;
  partnerSignatureRef?: Ref<HTMLDivElement>;
}) {
  const hasOwnerSigned =
    contract.status === "owner_signed" || contract.status === "completed";
  const hasPartnerSigned = contract.status === "completed";

  return (
    <section className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
      <Signature
        title="Bên A"
        subtitle="Người sử dụng lao động"
        name={contract.ownerCompanyInfo.ownerName}
        signed={hasOwnerSigned}
        signatureRef={ownerSignatureRef}
      />
      <Signature
        title="Bên B"
        subtitle="Người lao động"
        name={employeeName}
        signed={hasPartnerSigned}
        signatureRef={partnerSignatureRef}
      />
    </section>
  );
}

const ARTICLE_SUMMARIES = [
  [
    "Điều 2: Thời gian làm việc và bảo hộ lao động",
    "Thời gian làm việc, thiết bị, phương tiện đi lại và điều kiện an toàn lao động thực hiện theo lịch và quy định của Công ty.",
  ],
  [
    "Điều 4: Hình thức và thời hạn trả lương",
    "Tiền lương được thanh toán từ ngày 05 đến ngày 10 của tháng kế tiếp sau khi thực hiện các nghĩa vụ thuế và bảo hiểm theo quy định.",
  ],
  [
    "Điều 5: Quyền lợi và nghĩa vụ của người lao động",
    "Người lao động được hưởng chế độ nghỉ, bảo hiểm, đào tạo, nâng lương và có nghĩa vụ hoàn thành công việc, bảo mật, bàn giao đầy đủ.",
  ],
  [
    "Điều 6: Nghĩa vụ và quyền hạn của người sử dụng lao động",
    "Công ty bảo đảm việc làm, thanh toán quyền lợi và có quyền điều hành, bố trí, kỷ luật lao động theo pháp luật và nội quy.",
  ],
  [
    "Điều 7: Đơn phương chấm dứt hợp đồng",
    "Hai bên thực hiện quyền chấm dứt hợp đồng, thời hạn báo trước và trách nhiệm bàn giao theo Bộ luật Lao động và nội quy Công ty.",
  ],
  [
    "Điều 8: Thỏa thuận không cạnh tranh",
    "Người lao động tuân thủ nghĩa vụ không cạnh tranh, không tiết lộ thông tin và bồi thường thiệt hại khi vi phạm.",
  ],
  [
    "Điều 9: Sử dụng hình ảnh và thông tin cá nhân",
    "Việc thu thập, sử dụng hình ảnh và thông tin cá nhân được thực hiện cho mục đích hợp pháp theo nội dung hợp đồng.",
  ],
  [
    "Điều 10: Những thỏa thuận khác",
    "Các thỏa thuận về bảo mật lương, điều chuyển công việc, công tác, đào tạo và phụ lục được thực hiện theo nhu cầu hợp pháp của Công ty.",
  ],
  [
    "Điều 11: Giải quyết tranh chấp",
    "Tranh chấp được ưu tiên thương lượng, hòa giải; nếu không thành sẽ giải quyết tại Tòa án có thẩm quyền tại Thành phố Hồ Chí Minh.",
  ],
  [
    "Điều 12: Điều khoản thi hành",
    "Hợp đồng và phụ lục là một bộ phận không tách rời, được lập thành hai bản có giá trị như nhau và có hiệu lực kể từ ngày ký.",
  ],
] as const;

export function EmploymentContractDocument({
  contract,
  ownerSignatureRef,
  partnerSignatureRef,
}: {
  contract: Contract;
  ownerSignatureRef?: Ref<HTMLDivElement>;
  partnerSignatureRef?: Ref<HTMLDivElement>;
}) {
  const data = getEmploymentData(contract);

  if (!data) {
    return (
      <article className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-10 text-black shadow-sm">
        Không tìm thấy dữ liệu hợp đồng lao động.
      </article>
    );
  }

  const owner = contract.ownerCompanyInfo;
  const person = data.personalInfo;
  const longDate = formatLongDate(data.contractDate);

  return (
    <div className="mx-auto block w-full max-w-5xl space-y-8 pb-24 text-black">
      <article className="rounded-2xl bg-white px-6 py-10 text-[14px] leading-6 shadow-sm sm:px-12">
        <ContractHeader
          companyName={owner.companyName}
          contractNumber={contract.contractNumber}
          contractDate={longDate}
        />

        <section className="mt-10 text-center">
          <h1 className="text-2xl font-semibold uppercase">
            Hợp đồng lao động
          </h1>
        </section>

        <section className="mt-8 space-y-1">
          <p>- Căn cứ Bộ luật Dân sự số 91/2015/QH13;</p>
          <p>- Căn cứ Bộ luật Lao động số 45/2019/QH14;</p>
          <p>- Căn cứ quy định của {owner.companyName};</p>
          <p>- Căn cứ khả năng và nhu cầu của hai bên.</p>
        </section>

        <p className="mt-6">
          Hôm nay, {longDate}, tại văn phòng {owner.companyName}, chúng tôi gồm:
        </p>

        <section className="mt-6">
          <h2 className="font-semibold uppercase">
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
          <h2 className="font-semibold uppercase">Bên B (Người lao động)</h2>
          <dl className="mt-2">
            <PartyRow label="Họ và tên" value={person.fullName} />
            <PartyRow
              label="Ngày sinh / Giới tính"
              value={`${formatDate(person.dateOfBirth)} / ${person.gender}`}
            />
            <PartyRow
              label="CCCD / Ngày cấp"
              value={`${person.citizenId} / ${formatDate(person.citizenIdIssuedDate)}`}
            />
            <PartyRow label="Nơi cấp" value={person.citizenIdIssuedPlace} />
            <PartyRow label="Nơi thường trú" value={person.permanentAddress} />
            <PartyRow
              label="Nơi đang sinh sống"
              value={person.currentAddress}
            />
            <PartyRow label="Mã số thuế" value={person.taxCode} />
            <PartyRow label="Mã số BHXH" value={person.socialInsuranceNumber} />
            <PartyRow
              label="Liên hệ khẩn cấp"
              value={person.emergencyContact}
            />
          </dl>
        </section>

        <section className="mt-8">
          <h2 className="font-semibold uppercase">
            Điều 1: Thời hạn và công việc
          </h2>
          <div className="mt-2 space-y-1">
            <p>- Thời hạn hợp đồng: {data.contractTerm}.</p>
            <p>- Bắt đầu từ ngày: {formatDate(data.startDate)}.</p>
            <p>- Địa điểm làm việc: {data.workLocation}.</p>
            <p>- Chức danh/vị trí: {person.position}.</p>
            <p>- Phòng ban/Bộ phận: {person.department}.</p>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="font-semibold uppercase">
            Điều 3: Mức lương và các khoản liên quan
          </h2>
          <div className="mt-2 space-y-1">
            <p>- Mức lương chính: {formatMoney(data.baseSalary)} VND/tháng.</p>
            <p>- Bằng chữ: {data.salaryInWords}.</p>
            <p>- Các khoản bổ sung được quy định tại phụ lục kèm theo.</p>
          </div>
        </section>

        {ARTICLE_SUMMARIES.map(([title, content]) => (
          <section key={title} className="mt-6">
            <h2 className="font-semibold uppercase">{title}</h2>
            <p className="mt-2 text-justify">{content}</p>
          </section>
        ))}

        <SignatureArea contract={contract} employeeName={person.fullName} />
        <p className="mt-10 text-center text-xs text-black/45">
          Hợp đồng lao động · Trang 1–7/9
        </p>
      </article>

      <article className="rounded-2xl bg-white px-6 py-10 text-[14px] leading-6 shadow-sm sm:px-12">
        <ContractHeader
          companyName={owner.companyName}
          contractNumber={contract.contractNumber}
          contractDate={longDate}
        />
        <section className="mt-10 text-center">
          <h1 className="text-2xl font-semibold uppercase">
            Phụ lục hợp đồng lao động
          </h1>
        </section>

        <p className="mt-8">
          Căn cứ Hợp đồng lao động số {contract.contractNumber} ký {longDate},
          hai bên thống nhất phụ lục sau đây là bộ phận không thể tách rời của
          hợp đồng.
        </p>

        <section className="mt-8">
          <h2 className="font-semibold uppercase">Điều 1: Nội dung thay đổi</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-black/15">
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
                className={`grid grid-cols-[1fr_180px] border-b border-black/10 px-4 py-2 last:border-0 ${
                  index === 5 ? "font-semibold" : ""
                }`}
              >
                <span>{label}</span>
                <span className="text-right">{formatMoney(value)} đồng</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-semibold uppercase">
            Điều 2: Thời gian thực hiện
          </h2>
          <p className="mt-2 text-justify">
            Phụ lục có hiệu lực từ ngày ký đến khi Hợp đồng lao động số{" "}
            {contract.contractNumber} hết hiệu lực; được lập thành hai bản có
            giá trị như nhau, mỗi bên giữ một bản.
          </p>
        </section>

        <SignatureArea
          contract={contract}
          employeeName={person.fullName}
          ownerSignatureRef={ownerSignatureRef}
          partnerSignatureRef={partnerSignatureRef}
        />
        <p className="mt-10 text-center text-xs text-black/45">
          Phụ lục hợp đồng lao động · Trang 8–9/9
        </p>
      </article>
    </div>
  );
}
