import { motion } from "framer-motion";
import type { Ref } from "react";
import type { Contract, ProbationContractDataPayload } from "@/types/Contract";

function formatDate(value?: string | null) {
  if (!value) return ".../.../....";
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
  if (value === null || value === undefined || value === "") return "-";
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return String(value);
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
    numberValue,
  );
}

function getProbationData(contract: Contract) {
  const data = contract.contractData;
  if (!data || !("probationStartDate" in data) || !("personalInfo" in data)) {
    return null;
  }
  return data as ProbationContractDataPayload;
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
    <header className="grid grid-cols-1 gap-8 text-center text-[14px] leading-7 text-black/62 sm:grid-cols-2 dark:text-white/62">
      <div>
        <p className="font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
          {companyName}
        </p>
        <p className="mt-2">Số: {contractNumber}</p>
      </div>
      <div>
        <p className="font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
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
    <div className="grid grid-cols-1 gap-1 border-b border-black/10 py-1.5 last:border-0 sm:grid-cols-[190px_1fr] sm:gap-3 dark:border-white/10">
      <dt className="text-black/35 dark:text-white/35">{label}</dt>
      <dd className="font-semibold text-black/86 dark:text-white/86">
        {value || "-"}
      </dd>
    </div>
  );
}

type ArticleGroup = {
  title?: string;
  intro?: string;
  items: string[];
  ordered?: boolean;
};

function ContractArticle({
  title,
  groups,
}: {
  title: string;
  groups: ArticleGroup[];
}) {
  return (
    <section className="mt-8">
      <h2 className="text-[13px] font-medium tracking-[0.12em] text-black/80 uppercase dark:text-white/80">
        {title}
      </h2>
      <div className="mt-3 space-y-4 text-justify">
        {groups.map((group, groupIndex) => (
          <div key={`${title}-${group.title || groupIndex}`}>
            {group.title ? (
              <h3 className="font-semibold text-black/86 dark:text-white/86">
                {group.title}
              </h3>
            ) : null}
            {group.intro ? <p className="mt-1">{group.intro}</p> : null}
            {group.ordered ? (
              <ol className="mt-2 list-decimal space-y-2 pl-5">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Signature({
  title,
  subtitle,
  name,
  signed,
  signatureRef,
  revealKey,
}: {
  title: string;
  subtitle: string;
  name: string;
  signed: boolean;
  signatureRef?: Ref<HTMLDivElement>;
  revealKey?: number;
}) {
  const displayName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

  return (
    <div ref={signatureRef} className="relative text-center">
      <p className="text-[13px] font-medium tracking-[0.08em] text-black/80 uppercase dark:text-white/80">
        {title}
      </p>
      <p className="mt-2 text-[12px] text-black/35 dark:text-white/35">
        {subtitle} · Ký, ghi rõ họ và tên
      </p>
      {signed && displayName ? (
        <motion.div
          key={`${displayName}-${revealKey ?? 0}`}
          initial={
            revealKey ? { opacity: 0, y: 12, filter: "blur(7px)" } : false
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex h-36 max-w-[300px] items-center justify-center text-[54px] leading-none text-[#111111] dark:text-white"
          style={{
            fontFamily:
              '"Allura", "Sriracha", "Segoe Script", "Snell Roundhand", cursive',
          }}
        >
          {displayName}
        </motion.div>
      ) : (
        <div className="h-32" />
      )}
      {signed ? (
        <p className="mb-2 text-[11px] font-medium tracking-[0.16em] text-emerald-700 uppercase dark:text-emerald-200/80">
          Đã ký
        </p>
      ) : null}
      <p className="text-[14px] font-medium text-[#111111] uppercase dark:text-white">
        {name || "-"}
      </p>
    </div>
  );
}

const STATIC_ARTICLES: Array<{ title: string; groups: ArticleGroup[] }> = [
  {
    title: "Điều 2: Thời gian làm việc",
    groups: [
      {
        title: "1. Thời gian làm việc",
        items: [
          "Buổi sáng: 8h00 – 12h00 từ thứ 2 đến thứ 7.",
          "Buổi chiều: 13h30 – 17h00 từ thứ 2 đến thứ 7.",
        ],
      },
      {
        items: [
          "2. Được cấp phát những thiết bị, dụng cụ làm cần thiết phục vụ cho công việc để nhân viên có thể hoàn thành công việc một cách có hiệu quả nhất. Nhân viên có trách nhiệm bảo quản, giữ gìn trang thiết bị ở điều kiện tốt nhất.",
          "3. Phương tiện đi lại: Tự túc.",
          "4. Điều kiện an toàn và vệ sinh lao động tại nơi làm việc theo quy định của pháp luật hiện hành.",
        ],
      },
    ],
  },
  {
    title: "Điều 4: Thỏa thuận không cạnh tranh",
    groups: [
      {
        intro:
          "1. Trong thời gian thử việc và 6 tháng sau khi kết thúc hợp đồng, Người lao động không được phép:",
        items: [
          "Làm việc hoặc hợp tác với bất kỳ công ty nào khác có xung đột về lợi ích tương tự với Công ty.",
          "Tiếp cận hoặc cung cấp dịch vụ cho các khách hàng của Công ty.",
        ],
      },
      {
        items: [
          "Vi phạm điều khoản không cạnh tranh sẽ bị xử lý theo quy định của pháp luật và Công ty có quyền yêu cầu bồi thường thiệt hại.",
        ],
      },
    ],
  },
  {
    title: "Điều 5: Quyền lợi và nghĩa vụ của người lao động",
    groups: [
      {
        title: "A. Quyền lợi",
        ordered: true,
        items: [
          "Phương tiện đi lại: Cá nhân tự túc.",
          "Cấp phát những dụng cụ làm việc gồm: Theo tính chất và phân công công việc.",
          "Chế độ nghỉ ngơi: Nghỉ ngơi theo lịch làm việc tại Văn phòng.",
          "Chế độ đào tạo: Được Công ty đào tạo nâng cao năng lực chuyên môn và kỹ năng công việc. Ngoài ra, do yêu cầu của công việc người lao động phải hoàn thành các khóa học theo sự điều động của cấp trên.",
          "Chế độ thưởng: Ngoài lương và phụ cấp, người lao động sẽ được thưởng theo quy định của pháp luật Lao động và Nội quy Công ty.",
          "Nghỉ việc: Người lao động có quyền đơn phương chấm dứt hợp đồng và được coi là không vi phạm hợp đồng thử việc khi: 6.1. Người lao động nghỉ việc thuộc một trong những trường hợp được quy định theo Luật Lao động hiện hành. 6.2. Có đơn xin thôi việc trước ít nhất 03 - 05 ngày làm việc kể từ ngày nộp đơn gửi lên cấp trên để Công ty có kế hoạch tìm nhân sự thay thế. 6.3. Người lao động có trách nhiệm thanh quyết toán các khoản tài chính có liên quan, bàn giao trang thiết bị, dụng cụ, công việc được giao cho Công ty trước khi chấm dứt hợp đồng.",
        ],
      },
      {
        title: "B. Nghĩa vụ",
        ordered: true,
        items: [
          "Thực hiện công việc với trách nhiệm và đảm bảo hiệu quả.",
          "Tuân thủ các quy định bảo mật thông tin, kỷ luật lao động và văn hóa Công ty.",
          "Chấp hành mọi điều động công việc của Công ty.",
        ],
      },
      {
        intro:
          "Trong vòng 7 ngày làm việc, kể từ ngày ký kết Hợp đồng này, người lao động phải nộp đầy đủ Hồ sơ Nhân sự, gồm:",
        items: [
          "Sơ yếu lý lịch (có công chứng);",
          "Chứng minh thư nhân dân/căn cước công dân/Hộ chiếu hoặc các giấy tờ chứng minh nhân thân có giá trị tương đương (có công chứng);",
          "Bằng cấp (có công chứng);",
          "Giấy khám sức khỏe (bản chính).",
        ],
      },
    ],
  },
  {
    title: "Điều 6: Nghĩa vụ và quyền hạn của người sử dụng lao động",
    groups: [
      {
        title: "A. Nghĩa vụ",
        ordered: true,
        items: [
          "Bảo đảm việc làm và thực hiện đầy đủ những điều khoản trong hợp đồng.",
          "Thanh toán đầy đủ, đúng thời hạn các chế độ và quyền lợi cho người lao động theo hợp đồng này.",
          "Trong trường hợp chậm thanh toán các chế độ và quyền lợi cho người lao động theo hợp đồng này thì người sử dụng lao động phải có nghĩa vụ trả lãi của khoản tiền chậm thanh toán. Lãi suất chi trả theo lãi suất Ngân hàng Nhà nước Việt Nam.",
          "Thực hiện hướng dẫn, đào tạo cho người lao động về quy chế, quy định của Công ty.",
        ],
      },
      {
        title: "B. Quyền hạn",
        ordered: true,
        items: [
          "Điều hành người lao động hoàn thành công việc theo Hợp đồng (bố trí, điều chuyển, tạm ngừng việc).",
          "Tạm hoãn, chấm dứt hợp đồng thử việc, kỷ luật người lao động theo quy định của pháp luật lao động hiện hành và nội quy lao động, thỏa ước lao động tập thể (nếu có) của Công ty.",
          "Có quyền khiếu nại và đòi người lao động bồi thường khi người lao động vi phạm các điều đã cam kết trong hợp đồng này.",
          "Có quyền được đơn phương chấm dứt hợp đồng thử việc nếu người lao động vi phạm nghiêm trọng các nội quy, quy định của Công ty và làm ảnh hưởng đến tài sản, uy tín của Công ty.",
        ],
      },
    ],
  },
  {
    title: "Điều 7: Chấm dứt hợp đồng",
    groups: [
      {
        intro: "Các Bên thỏa thuận các trường hợp chấm dứt Hợp đồng như sau:",
        ordered: true,
        items: [
          "Một bên có hành vi vi phạm các điều khoản cơ bản của Hợp đồng và không khắc phục vi phạm trong thời hạn kể từ ngày nhận được thông báo yêu cầu khắc phục bằng văn bản của Bên bị vi phạm. Thời hạn quy định do các bên thỏa thuận, nếu không thỏa thuận được thì thời hạn quy định là 03 ngày.",
          "Theo thỏa thuận giữa các Bên.",
          "Các Bên hoàn thành trách nhiệm của mình và không có thỏa thuận khác.",
          "Một bên đơn phương chấm dứt Hợp đồng trước thời hạn quy định tại Điều 5 của Hợp đồng.",
        ],
      },
    ],
  },
  {
    title: "Điều 8: Giải quyết tranh chấp",
    groups: [
      {
        ordered: true,
        items: [
          "Những vấn đề lao động khác không ghi trong hợp đồng này thì áp dụng theo quy định của quy chế và nội quy lao động của Công ty, cũng như pháp luật Lao động Việt Nam và có hiệu lực thi hành tại thời điểm ký hợp đồng lao động này.",
          "Trong quá trình thực hiện hợp đồng nếu có tình huống phát sinh, các bên giải quyết trên cơ sở thương lượng và hòa giải.",
          "Trong trường hợp không thể hòa giải được thì vụ việc sẽ tiến hành giải quyết tại Tòa án nhân dân có thẩm quyền tại Thành phố Hồ Chí Minh.",
        ],
      },
    ],
  },
  {
    title: "Điều 9: Điều khoản thi hành",
    groups: [
      {
        ordered: true,
        items: [
          "Những vấn đề về lao động không ghi trong hợp đồng này thì áp dụng quy định của nội quy, quy chế quản lý nội bộ của Công ty và Bộ luật Lao động.",
          "Khi hợp đồng này được ký kết sẽ chấm dứt toàn bộ hiệu lực của các Hợp đồng và Phụ lục Hợp đồng đã được hai bên ký trước đó.",
          "Hợp đồng này gồm 04 trang, được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản để thực hiện và có hiệu lực kể từ ngày ký.",
          "Khi hết thời hạn hợp đồng, nếu Công ty không có nhu cầu tiếp tục sử dụng người lao động thì hợp đồng thử việc này tự động hết hiệu lực và được thanh lý.",
        ],
      },
    ],
  },
];

export function ProbationContractDocument({
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
  const data = getProbationData(contract);
  if (!data) {
    return (
      <article className="mx-auto w-full max-w-5xl p-10 text-black dark:text-white">
        Không tìm thấy dữ liệu hợp đồng thử việc.
      </article>
    );
  }

  const owner = contract.ownerCompanyInfo;
  const person = data.personalInfo;
  const longDate = formatLongDate(data.contractDate);
  const hasOwnerSigned =
    contract.status === "owner_signed" || contract.status === "completed";
  const hasPartnerSigned = contract.status === "completed";

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={`mx-auto w-full max-w-5xl pb-24 text-[14px] leading-7 text-black/62 dark:text-white/62 ${appearance === "public" ? "dark" : ""}`}
    >
      <ContractHeader
        companyName={owner.companyName}
        contractNumber={contract.contractNumber}
        contractDate={longDate}
      />

      <section className="mt-10 text-center">
        <h1 className="text-4xl font-medium tracking-[0.03em] text-[#111111] uppercase dark:text-white">
          Hợp đồng thử việc
        </h1>
      </section>

      <section className="mt-8 space-y-1">
        <p>
          - Căn cứ Bộ luật Dân sự số 91/2015/QH13 ban hành ngày 24 tháng 11 năm
          2015;
        </p>
        <p>
          - Căn cứ vào Bộ luật Lao động số 45/2019/QH14 ban hành ngày 20 tháng
          11 năm 2019;
        </p>
        <p>- Căn cứ vào quy định của {owner.companyName};</p>
        <p>- Căn cứ vào khả năng và nhu cầu của hai bên.</p>
      </section>

      <p className="mt-6">
        Hôm nay, {longDate}, tại văn phòng {owner.companyName}, chúng tôi gồm:
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

      <p className="mt-4">Và:</p>
      <section className="mt-6">
        <h2 className="text-[13px] font-medium tracking-[0.12em] text-black/80 uppercase dark:text-white/80">
          Bên B (Người lao động)
        </h2>
        <dl className="mt-2">
          <PartyRow label="Họ và tên" value={person.fullName} />
          <PartyRow
            label="Ngày sinh / Giới tính"
            value={`${formatDate(person.dateOfBirth)} / ${person.gender || "-"}`}
          />
          <PartyRow
            label="CCCD / Ngày cấp"
            value={`${person.citizenId || "-"} / ${formatDate(person.citizenIdIssuedDate)}`}
          />
          <PartyRow label="Nơi cấp" value={person.citizenIdIssuedPlace} />
          <PartyRow label="Nơi thường trú" value={person.permanentAddress} />
          <PartyRow label="Nơi đang sinh sống" value={person.currentAddress} />
          <PartyRow label="Mã số thuế" value={person.taxCode} />
          <PartyRow
            label="Số sổ lao động/BHXH"
            value={person.socialInsuranceNumber}
          />
          <PartyRow label="Liên hệ khẩn cấp" value={person.emergencyContact} />
        </dl>
      </section>

      <p className="mt-8 text-justify">
        Hai bên đã thỏa thuận ký kết Hợp đồng thử việc và cam kết thực hiện
        nghiêm túc những điều khoản sau đây:
      </p>

      <ContractArticle
        title="Điều 1: Thời hạn và công việc"
        groups={[
          {
            ordered: true,
            items: [
              `Thời hạn hợp đồng: Có hiệu lực từ ngày ${formatDate(data.probationStartDate)} đến ngày ${formatDate(data.probationEndDate)} và kéo dài tối đa 60 ngày.`,
              `Vị trí công việc: ${person.position || "-"}.`,
              `Phòng ban/Bộ phận: ${person.department || "-"}.`,
              "Công việc: Thực hiện theo phân công của Trưởng dự án/Ban Giám đốc.",
              `Địa điểm làm việc: ${data.workLocation || "Tại văn phòng chính hoặc các địa điểm khác theo quyết định của Công ty"}.`,
            ],
          },
        ]}
      />

      <ContractArticle {...STATIC_ARTICLES[0]} />

      <ContractArticle
        title="Điều 3: Mức lương và các khoản liên quan"
        groups={[
          {
            ordered: true,
            items: [
              `Mức lương thử việc: ${formatMoney(data.probationSalary)} VND/tháng.`,
              "Các khoản phụ cấp: Không.",
              "Các khoản bổ sung: Không.",
            ],
          },
          {
            items: [
              `Tiền thưởng hiệu quả công việc: ${formatMoney(data.performanceBonus)} VND/tháng.`,
              "Mức tiền cụ thể hàng tháng phụ thuộc vào tỷ lệ % hoàn thành kế hoạch và quy định về tiền thưởng hiệu quả công việc của Công ty từng thời điểm.",
              "Tiền thưởng sáng kiến: Mức tiền cụ thể hàng tháng phụ thuộc vào số lượng sáng kiến mỗi tháng và quy định về tiền thưởng sáng kiến của Công ty từng thời điểm.",
              "Tiền thưởng doanh thu: Mức tiền cụ thể hàng tháng phụ thuộc vào doanh số đảm nhận và quy định về thưởng doanh số của Công ty từng thời điểm.",
            ],
          },
          {
            title: "4. Thuế thu nhập cá nhân (TNCN)",
            items: [
              "Người lao động tự chịu trách nhiệm kê khai và nộp thuế thu nhập cá nhân. Công ty sẽ khấu trừ thuế TNCN tại nguồn trước khi thanh toán lương cho nhân viên.",
              "Công ty sẽ cung cấp chứng từ khấu trừ thuế thu nhập cá nhân để người lao động thực hiện quyết toán với cơ quan thuế.",
            ],
          },
          {
            items: [
              "5. Thời hạn trả lương: Lương được thanh toán vào ngày 05 của tháng kế tiếp.",
            ],
          },
        ]}
      />

      {STATIC_ARTICLES.slice(1).map((article) => (
        <div key={article.title}>
          <ContractArticle title={article.title} groups={article.groups} />
          {article.title.startsWith("Điều 5:") ? (
            <p className="mt-4 text-justify">
              Người lao động buộc phải đọc toàn bộ Nội quy Công ty và tuân thủ
              Nội quy đó. Mọi hành vi vi phạm sẽ được xử lý theo quy định và
              không được lấy lý do không biết đến quy định trong Nội quy lao
              động của {owner.companyName}.
            </p>
          ) : null}
        </div>
      ))}

      <section className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
        <Signature
          title="Bên A"
          subtitle="Người sử dụng lao động"
          name={owner.ownerName}
          signed={hasOwnerSigned}
          signatureRef={ownerSignatureRef}
          revealKey={ownerSignatureRevealKey}
        />
        <Signature
          title="Bên B"
          subtitle="Người lao động"
          name={person.fullName}
          signed={hasPartnerSigned}
          signatureRef={partnerSignatureRef}
          revealKey={partnerSignatureRevealKey}
        />
      </section>

      <p className="mt-10 text-center text-xs text-black/45 dark:text-white/35">
        Hợp đồng thử việc · Nội dung đầy đủ Điều 1–9
      </p>
    </motion.article>
  );
}
