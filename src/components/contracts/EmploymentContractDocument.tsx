import { motion } from "framer-motion";
import type { Ref } from "react";
import type { Contract, EmploymentContractDataPayload } from "@/types/Contract";
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

function getEmploymentData(contract: Contract) {
  const data = contract.contractData;
  if (!data || !("contractDate" in data) || !("personalInfo" in data)) {
    return null;
  }
  return data as EmploymentContractDataPayload;
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

const ARTICLES_4_TO_12: Array<{ title: string; groups: ArticleGroup[] }> = [
  {
    title: "Điều 4: Hình thức và thời hạn trả lương",
    groups: [
      {
        title: "1. Thời hạn trả lương",
        items: [
          "Được trả lương vào các ngày 05 đến ngày 10 của tháng kế tiếp dựa theo mức lương, các khoản phụ cấp, các chế độ phúc lợi và các khoản bổ sung khác (như: thưởng cải tiến, thưởng hoàn thành công việc, thưởng doanh thu) hàng tháng, sau khi trừ thuế thu nhập cá nhân (TNCN), tiền bảo hiểm xã hội/bảo hiểm y tế/bảo hiểm thất nghiệp (BHXH/BHYT/BHTN) người lao động chịu.",
          "Trường hợp tổng thu nhập trong năm lớn hơn tổng tiền lương hàng tháng đã nhận thì phần chênh lệch sẽ được quyết toán lại sau khi hoàn thành quyết toán thuế cho khách hàng và được chi trả trong vòng 15 ngày sau khi hoàn thành quyết toán thuế.",
          "Trường hợp kết thúc hợp đồng lao động giữa năm tài chính, sau khi hoàn tất thủ tục bàn giao thì phần chênh lệch sẽ được quyết toán trong vòng 30 ngày.",
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
          "Chế độ nghỉ ngơi: Nghỉ hàng tuần và các ngày phép, ngày lễ, ngày tết theo quy định của Công ty và Bộ luật Lao động. Nghỉ phép năm: 12 ngày phép một năm, với mỗi tháng có 01 ngày nghỉ phép có hưởng lương khi được ký hợp đồng lao động có thời hạn từ 01 năm trở lên. Vì yêu cầu công việc mà người lao động chưa nghỉ hết phép năm thì Công ty không thanh toán số tiền lương các ngày phép tồn của năm trước mà chỉ xem xét giải quyết cho người lao động nghỉ bù phép tồn của năm trước đến hết Quý 1 năm sau.",
          "Chế độ bảo hiểm: Bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp theo quy định của pháp luật Việt Nam.",
          "Chế độ đào tạo: Được Công ty đào tạo nâng cao năng lực chuyên môn và kỹ năng công việc trong trường hợp cần thiết. Ngoài ra, do yêu cầu của công việc người lao động phải hoàn thành các khóa học theo sự điều động của cấp trên.",
          "Chế độ nâng lương: Lương sẽ được xem xét lại hàng năm và có hiệu lực kể từ tháng điều chỉnh, được thể hiện bằng Quyết định điều chỉnh lương của Ban Giám đốc Công ty hoặc Phụ lục kèm theo HĐLĐ.",
          "Chế độ thưởng: Ngoài lương và phụ cấp, người lao động sẽ được thưởng theo quy định của pháp luật lao động và Nội quy Công ty.",
          "Nghỉ việc: Người lao động có quyền đơn phương chấm dứt hợp đồng khi thuộc trường hợp được Luật Lao động quy định; có đơn xin thôi việc trước ít nhất 30 ngày làm việc để Công ty tìm nhân sự thay thế; đồng thời thanh quyết toán các khoản tài chính liên quan, bàn giao trang thiết bị, dụng cụ và công việc trước khi chấm dứt hợp đồng.",
        ],
      },
      {
        title: "B. Nghĩa vụ",
        ordered: true,
        items: [
          "Thực hiện công việc với sự tận tâm, tận lực và trung thực, đảm bảo hoàn thành công việc với hiệu quả cao nhất theo sự phân công, điều hành của Ban Giám đốc Công ty và các cá nhân được bổ nhiệm hoặc ủy quyền phụ trách.",
          "Chấp hành mọi sự điều động của Lãnh đạo Công ty khi có yêu cầu.",
          "Thực hiện ký cam kết bảo mật đầy đủ. Tuyệt đối trung thành với Công ty, giữ bí mật và không để lộ thông tin của Công ty, đối tác giao dịch và khách hàng trong suốt thời gian làm việc và sau khi thôi việc.",
          "Nắm rõ và chấp hành nghiêm túc kỷ luật lao động, an toàn lao động, vệ sinh lao động, PCCC, văn hóa Công ty, nội quy lao động và các chủ trương, chính sách của Công ty.",
          "Bồi thường vi phạm và vật chất khi tiết lộ thông tin, gây tổn hại nghiêm trọng đến Công ty hoặc gây thiệt hại nghiêm trọng đến thiết bị, tài sản. Công ty có quyền chấm dứt hợp đồng trước thời hạn.",
          "Đóng các loại bảo hiểm bắt buộc, thuế thu nhập cá nhân đầy đủ theo quy định của pháp luật.",
          "Tham gia đầy đủ các chương trình đào tạo tập trung tại Công ty hoặc được cử đi đào tạo và hoàn thành khóa học đúng thời hạn.",
          "Người lao động có chứng chỉ hành nghề (kiểm toán viên, kế toán viên, đại lý thuế, thẩm định giá, luật sư) phải hoàn tất đầy đủ số giờ cập nhật kiến thức tối thiểu để đảm bảo hành nghề cho các năm sau.",
          "Kịp thời thông báo những thay đổi về nhân thân, địa chỉ thường trú/tạm trú dài hạn, trình độ học vấn, sức khỏe và các thông tin cá nhân liên quan được đề cập trong HĐLĐ và phụ lục.",
          "Trước khi chấm dứt hợp đồng, quyết toán các khoản tài chính, thanh toán các khoản nợ còn tồn đọng, bàn giao trang thiết bị, dụng cụ và công việc cho người tiếp nhận trong thời hạn quy định.",
          "Hoàn thành số liệu cho khách hàng đến tháng nghỉ việc.",
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
          "Thanh toán đầy đủ, đúng thời hạn các chế độ và quyền lợi cho người lao động.",
          "Nếu chậm thanh toán, người sử dụng lao động phải trả lãi của khoản tiền chậm thanh toán theo lãi suất Ngân hàng Nhà nước Việt Nam.",
          "Hướng dẫn, đào tạo người lao động về quy chế và quy định của Công ty.",
        ],
      },
      {
        title: "B. Quyền hạn",
        ordered: true,
        items: [
          "Điều hành người lao động hoàn thành công việc; bố trí, điều chuyển công việc theo chức năng chuyên môn, cử đi công tác hoặc điều chuyển nơi công tác.",
          "Chuyển tạm thời lao động, ngừng việc, thay đổi, tạm thời chấm dứt HĐLĐ và áp dụng các biện pháp kỷ luật theo pháp luật và nội quy Công ty trong thời gian hợp đồng còn giá trị.",
          "Tạm hoãn, chấm dứt hợp đồng, kỷ luật người lao động theo đúng pháp luật và nội quy lao động.",
          "Yêu cầu bồi thường, khiếu nại với cơ quan nhà nước để bảo vệ quyền lợi nếu người lao động vi phạm pháp luật hoặc hợp đồng.",
          "Trích thuế thu nhập cá nhân, các khoản bảo hiểm bắt buộc và nghĩa vụ pháp lý khác từ tiền lương, tiền công để nộp cho cơ quan có thẩm quyền.",
        ],
      },
    ],
  },
  {
    title: "Điều 7: Đơn phương chấm dứt HĐLĐ",
    groups: [
      {
        title: "1. Người sử dụng lao động",
        intro:
          "Người sử dụng lao động có quyền đơn phương chấm dứt HĐLĐ trong những trường hợp sau:",
        items: [
          "Người lao động thường xuyên không hoàn thành công việc theo sự phân công. Mức độ hoàn thành và cách đánh giá áp dụng theo Nội quy lao động, bản Phân công công việc và quy định nội bộ.",
          "Người lao động ốm đau đã điều trị 12 tháng liền, không đủ sức khỏe thực hiện công việc.",
          "Do thiên tai, hỏa hoạn, dịch bệnh nguy hiểm, địch họa hoặc di dời, thu hẹp sản xuất, kinh doanh theo yêu cầu của cơ quan có thẩm quyền mà Công ty đã tìm mọi biện pháp khắc phục nhưng vẫn buộc phải giảm chỗ làm việc.",
          "Người lao động gây thiệt hại nghiêm trọng về tài sản, lợi ích của Công ty hoặc vi phạm cam kết bảo mật.",
          "Người lao động tự ý bỏ việc không có lý do chính đáng từ 05 ngày làm việc liên tục trở lên hoặc tổng cộng 20 ngày trong một năm.",
          "Người lao động cung cấp không trung thực thông tin theo khoản 2 Điều 16 Bộ luật Lao động 2019 khi giao kết HĐLĐ, làm ảnh hưởng đến việc tuyển dụng.",
          "Người lao động vi phạm pháp luật hình sự hoặc bị cấm làm công việc ghi trong HĐLĐ theo bản án, quyết định có hiệu lực.",
        ],
      },
      {
        title: "2. Người lao động",
        intro:
          "Người lao động được đơn phương chấm dứt HĐLĐ trước thời hạn trong những trường hợp sau:",
        items: [
          "Không được bố trí đúng công việc hoặc không được bảo đảm điều kiện làm việc đã thỏa thuận.",
          "Không được trả công đầy đủ hoặc đúng thời hạn.",
          "Bị ngược đãi, đánh đập, nhục mạ, ảnh hưởng đến sức khỏe, nhân phẩm, danh dự; bị cưỡng bức lao động hoặc quấy rối tình dục tại nơi làm việc.",
          "Được bầu làm nhiệm vụ chuyên trách ở cơ quan dân cử hoặc được bổ nhiệm giữ chức vụ trong bộ máy Nhà nước.",
          "Người lao động nữ có thai phải nghỉ việc theo chỉ định của bác sĩ.",
          "Người lao động bị ốm đau, tai nạn đã điều trị 03 tháng liền mà khả năng lao động chưa hồi phục.",
          "Phải đảm bảo thời hạn báo trước ít nhất 30 ngày đối với HĐLĐ xác định thời hạn 01 năm.",
        ],
      },
    ],
  },
  {
    title: "Điều 8: Thỏa thuận không cạnh tranh",
    groups: [
      {
        ordered: true,
        items: [
          "Trong suốt thời gian làm việc và 12 tháng sau khi nghỉ việc, người lao động không được làm việc cho công ty đối thủ hoặc cung cấp dịch vụ cho khách hàng của Công ty; không được tiết lộ thông tin liên quan đến hoạt động kinh doanh, tài chính hoặc khách hàng.",
          "Nếu vi phạm, Công ty có quyền yêu cầu bồi thường thiệt hại bằng 05 (năm) tháng lương quy định tại Điều 3 mà người lao động nhận gần nhất tính đến khi nghỉ việc.",
        ],
      },
    ],
  },
  {
    title: "Điều 9: Sử dụng hình ảnh và thông tin cá nhân của người lao động",
    groups: [
      {
        title: "1. Mục đích và thời gian sử dụng",
        items: [
          "Trong thời gian làm việc và sau khi chấm dứt HĐLĐ, Công ty có quyền tiếp tục sử dụng hình ảnh, video và thông tin cá nhân được thu thập trong quá trình làm việc để truyền thông nội bộ, quảng bá, tiếp thị sản phẩm và dịch vụ, bao gồm đăng trên kênh truyền thông, website, mạng xã hội và ấn phẩm của Công ty.",
        ],
      },
      {
        title: "2. Quyền yêu cầu ngừng sử dụng",
        items: [
          "Người lao động có quyền yêu cầu ngừng sử dụng sau khi chấm dứt hợp đồng bằng thông báo văn bản. Công ty sẽ ngừng sử dụng trong hoạt động tương lai nhưng không có nghĩa vụ gỡ bỏ hoặc thu hồi nội dung đã phát hành, đăng tải hoặc được bên thứ ba sử dụng lại.",
          "Người lao động hiểu việc kiểm soát toàn bộ sự lan truyền trên mạng xã hội và các kênh bên ngoài là rất khó khăn; Công ty không chịu trách nhiệm về hình ảnh được bên thứ ba phát hành lại.",
        ],
      },
      {
        title: "3. Cam kết của Công ty",
        items: [
          "Công ty chỉ sử dụng hình ảnh và thông tin cá nhân vào mục đích hợp pháp và không chuyển giao cho bên thứ ba ngoài mục đích nêu trên nếu không có sự đồng ý của người lao động.",
        ],
      },
      {
        title: "4. Trách nhiệm đối với yêu cầu gỡ bỏ",
        items: [
          "Công ty không chịu trách nhiệm đối với việc sử dụng lại hình ảnh bởi bên thứ ba mà Công ty không kiểm soát và không chịu trách nhiệm gỡ bỏ nội dung hình ảnh, video đã phát hành trước đó.",
        ],
      },
    ],
  },
  {
    title: "Điều 10: Những thỏa thuận khác",
    groups: [
      {
        ordered: true,
        items: [
          "Thông tin về tiền lương, tiền công phải được bảo mật.",
          "Người lao động đồng ý và chấp thuận các nội dung dưới đây.",
          "Khi Công ty cơ cấu, thành lập mới, sắp xếp lại tổ chức, đổi mới công nghệ hoặc thay đổi chiến lược kinh doanh, Công ty có quyền điều chuyển người lao động sang vị trí hoặc công việc khác phù hợp và có trách nhiệm đào tạo theo pháp luật.",
          "Sẵn sàng đi công tác hoặc thay đổi địa điểm làm việc đến địa phương khác, Chi nhánh/Văn phòng đại diện khác trong hệ thống theo sự điều hành của Công ty.",
          "Những sáng kiến, sáng tạo được thẩm định và áp dụng trong công việc thuộc tài sản và quyền khai thác của Công ty.",
          "Tham gia đầy đủ các khóa đào tạo định kỳ online và đào tạo tập trung. Nếu vắng từ 02 buổi/tháng và 05 buổi/năm cộng dồn không có lý do chính đáng thì chấp thuận mọi hình thức xử lý từ Công ty.",
          "Nếu một bên cần thay đổi nội dung HĐLĐ phải báo trước ít nhất 05 ngày và ký Phụ lục theo pháp luật. Trong thời gian thỏa thuận, hai bên vẫn tuân theo HĐLĐ đã ký.",
          "Người lao động đồng ý cho Công ty tiết lộ thông tin cá nhân gồm nhưng không giới hạn họ tên, địa chỉ, quá trình làm việc, lương thưởng và thông tin liên quan đến công việc cho các tổ chức quy định dưới đây.",
          "Các đơn vị liên kết, đơn vị trực thuộc (bao gồm Chi nhánh, Văn phòng đại diện) và các bên tư vấn pháp luật, quản trị của Công ty.",
          "Các đối tác, nhà cung cấp dịch vụ hoặc các bên khác với điều kiện Công ty yêu cầu họ tuân thủ bảo mật.",
        ],
      },
    ],
  },
  {
    title: "Điều 11: Giải quyết tranh chấp",
    groups: [
      {
        ordered: true,
        items: [
          "Những vấn đề lao động khác không ghi trong hợp đồng áp dụng theo quy chế, nội quy lao động của Công ty và pháp luật lao động Việt Nam có hiệu lực tại thời điểm ký.",
          "Nếu phát sinh tình huống trong quá trình thực hiện, các bên giải quyết trên cơ sở thương lượng và hòa giải.",
          "Nếu không thể hòa giải, vụ việc được giải quyết tại Tòa án nhân dân có thẩm quyền tại Thành phố Hồ Chí Minh.",
        ],
      },
    ],
  },
  {
    title: "Điều 12: Điều khoản thi hành",
    groups: [
      {
        ordered: true,
        items: [
          "Những vấn đề về lao động không ghi trong HĐLĐ áp dụng theo Thỏa ước lao động tập thể, nội quy lao động và pháp luật lao động.",
          "Mọi thỏa thuận trong các HĐLĐ khác hoặc văn bản trước đây trái với HĐLĐ này đương nhiên hết hiệu lực.",
          "Hợp đồng được các bên hoàn toàn tự nguyện thỏa thuận và ký kết trong trạng thái tinh thần tỉnh táo, không bị lừa dối hay ép buộc, nhằm đảm bảo lợi ích của mỗi bên.",
          "Khi hai bên ký Phụ lục HĐLĐ thì nội dung Phụ lục có giá trị như nội dung của hợp đồng này.",
          "Hợp đồng được lập thành 02 (hai) bản có giá trị như nhau, Công ty giữ 01 bản, người lao động giữ 01 bản và có hiệu lực kể từ ngày ký.",
          "Hợp đồng được lập tại Văn phòng Công ty vào ngày ghi tại phần đầu hợp đồng.",
        ],
      },
    ],
  },
];

export function EmploymentContractDocument({
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
  const data = getEmploymentData(contract);

  if (!data) {
    return (
      <article className="mx-auto w-full max-w-5xl p-10 text-black dark:text-white">
        Không tìm thấy dữ liệu hợp đồng lao động.
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
      className={`mx-auto w-full max-w-5xl pb-24 text-[14px] leading-7 text-black/62 dark:text-white/62 ${appearance === "public" ? "dark" : ""}`}
    >
      <section>
        <ContractHeader
          companyName={owner.companyName}
          contractNumber={contract.contractNumber}
          contractDate={longDate}
        />

        <section className="mt-10 text-center">
          <h1 className="text-4xl font-medium tracking-[0.03em] text-[#111111] uppercase dark:text-white">
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
              value={`${formatDate(person.dateOfBirth)} / ${person.gender || "-"}`}
            />
            <PartyRow
              label="CCCD / Ngày cấp"
              value={`${person.citizenId || "-"} / ${formatDate(person.citizenIdIssuedDate)}`}
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
          <h2 className="text-[13px] font-medium tracking-[0.12em] text-black/80 uppercase dark:text-white/80">
            Điều 1: Thời hạn và công việc
          </h2>
          <div className="mt-2 space-y-1">
            <p>- Thời hạn hợp đồng: {data.contractTerm || "-"}.</p>
            <p>- Bắt đầu từ ngày: {formatDate(data.startDate)}.</p>
            <p>
              - Địa điểm làm việc: {data.workLocation || "-"} (và/hoặc các địa
              điểm khác thuộc mạng lưới của Công ty theo Quyết định của Công ty
              từng thời kỳ).
            </p>
            <p>- Chức danh/vị trí: {person.position || "-"}.</p>
            <p>- Phòng ban/Bộ phận: {person.department || "-"}.</p>
            <p>
              - Công việc phải thực hiện: Theo bảng mô tả công việc và/hoặc sự
              phân công của Ban Giám đốc/Người được ủy quyền.
            </p>
          </div>
        </section>

        <ContractArticle
          title="Điều 2: Thời gian làm việc và bảo hộ lao động"
          groups={[
            {
              title: "1. Thời gian làm việc",
              items: [
                "Buổi sáng: 8h00 – 12h00 từ thứ 2 đến sáng thứ 7.",
                "Buổi chiều: 13h30 – 17h00 từ thứ 2 đến thứ 7 (Thứ 7: nếu có công việc, người lao động đến Công ty hoặc làm việc tại nhà theo sự sắp xếp của quản lý và bảo đảm tiến độ công việc).",
              ],
            },
            {
              items: [
                "2. Được cấp phát những thiết bị, dụng cụ làm cần thiết phục vụ cho công việc để nhân viên có thể hoàn thành công việc một cách có hiệu quả nhất. Nhân viên có trách nhiệm bảo quản, giữ gìn trang thiết bị ở điều kiện tốt nhất.",
                "3. Phương tiện đi lại: Tự túc.",
                "4. Điều kiện an toàn và vệ sinh lao động tại nơi làm việc theo quy định của pháp luật hiện hành.",
              ],
            },
          ]}
        />

        <section className="mt-8">
          <h2 className="text-[13px] font-medium tracking-[0.12em] text-black/80 uppercase dark:text-white/80">
            Điều 3: Mức lương và các khoản liên quan
          </h2>
          <div className="mt-3 space-y-2 text-justify">
            <p>- Phương tiện đi lại làm việc: Cá nhân tự túc.</p>
            <p>
              - Mức lương chính hoặc tiền công: {formatMoney(data.baseSalary)}{" "}
              VND/tháng (Bằng chữ: {data.salaryInWords || "-"}).
            </p>
            <p>- Hình thức trả lương: Tiền mặt hoặc chuyển khoản.</p>
            <p>- Các khoản phụ cấp: Không.</p>
            <p>- Các khoản phúc lợi: Theo quy định của Công ty.</p>
            <p>- Chế độ nâng lương: Theo quy định của Công ty.</p>
            <p>
              - Chế độ nghỉ ngơi (nghỉ hàng tuần, phép năm, lễ tết...): Theo quy
              định pháp luật hiện hành.
            </p>
            <p>- Chế độ đào tạo: Theo quy định của Công ty.</p>
            <p>
              - Thuế TNCN, BHYT, BHXH, BHTN (nếu có): Theo quy định của pháp
              luật hiện hành.
            </p>
            <p>- Những thỏa thuận khác: Theo Phụ lục Hợp đồng (nếu có).</p>
            <p className="font-semibold text-black/86 dark:text-white/86">
              Các khoản bổ sung: Không.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Tiền tạm ứng hàng tháng: 0 VND/tháng. Mức tiền cụ thể hàng tháng
                phụ thuộc vào tỷ lệ % hoàn thành kế hoạch và quy định về tiền
                thưởng hiệu quả công việc của Công ty từng thời điểm.
              </li>
              <li>
                Tiền thưởng sáng kiến: Mức tiền cụ thể hàng tháng phụ thuộc vào
                số lượng sáng kiến mỗi tháng và quy định về tiền thưởng sáng
                kiến của Công ty từng thời điểm.
              </li>
              <li>
                Tiền thưởng doanh thu: Mức tiền cụ thể hàng tháng phụ thuộc vào
                doanh số đảm nhận và quy định về thưởng doanh số của Công ty
                từng thời điểm.
              </li>
            </ul>
          </div>
        </section>

        {ARTICLES_4_TO_12.map((article) => (
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

        <SignatureArea
          contract={contract}
          employeeName={person.fullName}
          ownerSignatureRevealKey={ownerSignatureRevealKey}
          partnerSignatureRevealKey={partnerSignatureRevealKey}
        />
        <p className="mt-10 text-center text-xs text-black/45 dark:text-white/35">
          Hợp đồng lao động · Trang 1–7/9
        </p>
      </section>

      <section className="mt-20 border-t border-black/10 pt-16 dark:border-white/10">
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
              value={`${formatDate(person.dateOfBirth)} / ${person.gender || "-"}`}
            />
            <PartyRow
              label="CCCD / Ngày cấp"
              value={`${person.citizenId || "-"} / ${formatDate(person.citizenIdIssuedDate)}`}
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
        <p className="mt-6 text-justify">
          Căn cứ Hợp đồng lao động số {contract.contractNumber} ký {longDate} và
          nhu cầu sử dụng lao động, hai bên cùng nhau thỏa thuận thay đổi một số
          nội dung của hợp đồng đã ký như sau:
        </p>

        <section className="mt-8">
          <h2 className="text-[13px] font-medium tracking-[0.12em] text-black/80 uppercase dark:text-white/80">
            Điều 1: Nội dung thay đổi
          </h2>
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
                className={`grid grid-cols-[1fr_180px] border-b border-black/10 px-4 py-2 last:border-0 dark:border-white/10 ${
                  index === 5 ? "font-semibold" : ""
                }`}
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
              khoản tương đương lương khác (nếu có) tùy theo hiệu quả công việc
              và kết quả kinh doanh của Công ty trong năm.
            </li>
            <li>
              BHXH, BHYT, BHTN: Theo quy định của Luật BHXH hiện hành về mức
              tham gia đóng và tỷ lệ đóng cho người lao động.
            </li>
            <li>
              Thuế TNCN phát sinh dựa trên tổng thu nhập hàng tháng của người
              lao động (nếu có) do người lao động chi trả và Công ty khấu trừ
              vào lương để trích nộp theo quy định.
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-[13px] font-medium tracking-[0.12em] text-black/80 uppercase dark:text-white/80">
            Điều 2: Thời gian thực hiện
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-justify">
            <li>
              Phụ lục hợp đồng có hiệu lực kể từ ngày ký cho đến khi Hợp đồng
              lao động đã ký kết hết hạn.
            </li>
            <li>
              Phụ lục này là bộ phận không thể tách rời của Hợp đồng lao động số{" "}
              {contract.contractNumber}, được làm thành hai bản có giá trị như
              nhau, mỗi bên giữ một bản và là cơ sở giải quyết khi có tranh chấp
              lao động.
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
          Phụ lục hợp đồng lao động · Trang 8–9/9
        </p>
      </section>
    </motion.article>
  );
}
