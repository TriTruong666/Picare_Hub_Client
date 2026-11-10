import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiExternalLink,
  FiShield,
  FiAlertTriangle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import { PATHS } from "@/config/paths";

const contents = [
  ["mo-hinh", "Mô hình vận hành đề xuất"],
  ["pham-vi", "Giới hạn quyền eBiz đến đâu?"],
  ["du-lieu", "Dữ liệu đi từ WMS về eBiz thế nào?"],
  ["loi-ich", "Lợi ích và đánh đổi"],
  ["lech-ton", "Những nguyên nhân lệch tồn còn lại"],
  ["san-sang", "Điều kiện sẵn sàng của từng nghiệp vụ"],
  ["su-co", "Xử lý khi hệ thống gặp sự cố"],
  ["lo-trinh", "Lộ trình chuyển đổi và phương án quay lại"],
  ["doi-soat", "Cách kiểm tra và đánh giá hiệu quả"],
  ["cau-hoi", "Câu hỏi thường gặp"],
] as const;

const benefits = [
  [
    "Một luồng khởi tạo giao dịch",
    "Nhân sự tạo phiếu trong luồng WMS đã được phân quyền, giảm tình huống cùng một nghiệp vụ được nhập lại trên cả WMS và eBiz.",
  ],
  [
    "Kiểm soát hàng khả dụng",
    "Giữ hàng, kiểm tra tồn và xác nhận theo lô được thực hiện theo quy trình thống nhất. Hiệu quả phụ thuộc vào việc các kênh phát sinh xuất hàng cùng tuân thủ luồng này.",
  ],
  [
    "Duyệt và truy vết rõ ràng",
    "Phiếu gắn với người tạo, người duyệt, thời điểm và lý do. Khi có chênh lệch, đội vận hành có thể lần theo giao dịch thay vì chỉ so hai con số tổng.",
  ],
  [
    "Giảm quyền ghi trực tiếp",
    "Thu hẹp số tài khoản được nhập, xuất, chuyển hoặc điều chỉnh tồn trên eBiz. Những thao tác ngoại lệ được giao riêng và có hồ sơ kiểm soát.",
  ],
  [
    "Dễ hướng dẫn nhân sự kho",
    "Nhân sự làm việc theo màn hình và các bước phù hợp với vai trò trên WMS, thay vì phải tự lựa chọn nhiều loại chứng từ ở nhiều phần mềm.",
  ],
  [
    "Duy trì dữ liệu phục vụ eBiz",
    "Các chứng từ thuộc luồng tích hợp đã nghiệm thu tiếp tục được ghi về eBiz để bộ phận có quyền tra cứu và xử lý nghiệp vụ liên quan.",
  ],
];

const tradeoffs = [
  [
    "WMS trở thành điểm vận hành quan trọng",
    "Khi WMS hoặc hạ tầng tích hợp gián đoạn, công việc có thể phải tạm dừng hoặc chuyển sang quy trình khẩn cấp đã được phê duyệt.",
  ],
  [
    "Vẫn phụ thuộc vào eBiz và đường truyền",
    "Dù thao tác tại WMS, bước ghi chứng từ và đọc kết quả vẫn có thể lỗi hoặc chậm. Giao diện WMS hoàn tất một bước chưa đủ để kết luận eBiz đã phản ánh đúng tồn.",
  ],
  [
    "Có độ trễ giữa hai hệ thống",
    "Người dùng có thể nhìn thấy số tồn khác nhau trong khoảng chờ gửi, xử lý hoặc đối soát. Cần biết đó là chênh lệch đã giải thích được hay một lỗi thật.",
  ],
  [
    "Phải hoàn thiện từng luồng trước khi chuyển",
    "Nghiệp vụ chưa có đường ghi, xác nhận hoặc xử lý lỗi đầy đủ không thể được thay thế chỉ bằng việc thu hồi quyền eBiz.",
  ],
  [
    "Tăng công việc vận hành tích hợp",
    "Cần người theo dõi giao dịch treo, hàng đợi, quyền tài khoản tích hợp, cảnh báo và đối soát; đồng thời duy trì sao lưu và khả năng khôi phục.",
  ],
  [
    "Cần đào tạo và kiểm soát ngoại lệ",
    "Nhân sự phải hiểu trạng thái chờ xử lý, cách báo sự cố và vì sao không được tự tạo lại phiếu sau timeout. Quy trình khẩn cấp cần đủ nhanh để tránh phát sinh thao tác ngoài kiểm soát.",
  ],
];

const accessRows = [
  [
    "Nhân sự kho / vận hành",
    "Tạo và xử lý phiếu theo quyền của từng nghiệp vụ trên WMS.",
    "Đề xuất bỏ quyền ghi trực tiếp đối với các nghiệp vụ kho đã chuyển đổi; giữ quyền xem nếu công việc cần.",
  ],
  [
    "Người được chọn duyệt",
    "Kiểm tra và duyệt hoặc từ chối phiếu được giao. Với chuyển kho, đây là tài khoản có vai trò Kho.",
    "Quyền duyệt trong WMS không đồng nghĩa với việc được lập một phiếu tương tự lần nữa trên eBiz.",
  ],
  [
    "Kế toán / tài chính",
    "Tra cứu, đối chiếu và duyệt các bước thuộc phạm vi được phân công.",
    "Tiếp tục nghiệp vụ kế toán và báo cáo theo phân quyền. Chứng từ kế toán có tác động tồn phải có luồng được thống nhất để tránh ghi trùng.",
  ],
  [
    "Quản lý / quản trị viên",
    "Giám sát trạng thái, quyền và các trường hợp cần đối soát.",
    "Giữ một nhóm tài khoản xử lý ngoại lệ được chỉ định; mỗi lần sửa trực tiếp phải có người phê duyệt và hồ sơ đối soát.",
  ],
  [
    "Tài khoản tích hợp",
    "Thực hiện các lệnh từ hệ thống theo luồng được cho phép.",
    "Dùng thông tin xác thực riêng, cấp đúng quyền cần thiết; không chia sẻ cho nhân sự đăng nhập thao tác thủ công.",
  ],
];

const riskRows = [
  [
    "Một nghiệp vụ được nhập hai lần",
    "Nhân sự thao tác trên WMS rồi tạo thêm phiếu eBiz cho cùng lượng hàng.",
    "Thu hẹp quyền ghi trực tiếp và đối chiếu mã chứng từ. Khi gửi lại qua tích hợp, phải dùng lại định danh của cùng giao dịch.",
  ],
  [
    "eBiz đã ghi nhưng phản hồi bị mất",
    "WMS nhận timeout dù eBiz có thể đã tạo phiếu.",
    "Đưa vào diện chưa rõ kết quả, tra cứu chứng từ trước khi thử lại. Không dùng một mã mới để gửi lại ngay.",
  ],
  [
    "Bản tồn trả về chưa cập nhật",
    "Lệnh ghi thành công nhưng lần đọc tiếp theo vẫn phản ánh thời điểm trước đó.",
    "Chỉ kết thúc đối soát khi có bằng chứng giao dịch đã được phản ánh; cần mốc dữ liệu hoặc khả năng kiểm tra chứng từ.",
  ],
  [
    "Dữ liệu đọc thiếu hoặc rỗng bất thường",
    "API trả thành công nhưng thiếu kho, thiếu lô hoặc thiếu một công ty.",
    "Kiểm tra độ đầy đủ trước khi áp dụng. Không tự suy ra mọi dòng bị thiếu đều đã hết tồn.",
  ],
  [
    "Biến động chờ bị tính thêm lần nữa",
    "Tồn eBiz đã bao gồm giao dịch nhưng WMS vẫn cộng hoặc trừ phần đang chờ xác nhận.",
    "Đối soát theo giao dịch, xác định phần nào đã nằm trong số tồn nguồn; không chỉ cộng trừ dựa trên tổng số lượng.",
  ],
  [
    "Sai danh mục hoặc đơn vị tính",
    "Đổi mã kho, lô, hạn dùng hoặc quy đổi thùng/cái không thống nhất.",
    "Quản lý nguồn danh mục rõ ràng, kiểm tra liên kết mã và quy đổi trước khi cho phép ghi nhận giao dịch.",
  ],
  [
    "Tồn vật lý ngoài quy trình",
    "Hàng hỏng, mất, nhận hoặc giao thực tế nhưng chưa có chứng từ hợp lệ.",
    "Kiểm kê và lập phiếu điều chỉnh được phê duyệt. Việc hai phần mềm bằng nhau không chứng minh hàng ngoài kho đã đúng.",
  ],
];

const readinessRows = [
  [
    "Chuyển kho",
    "Luồng hiện có chọn một người duyệt, gửi phiếu chuyển sang eBiz và đánh dấu Cần đối soát khi kết quả chưa xác định.",
    "Nghiệm thu đủ hai đầu kho, xử lý API chậm, lỗi sau khi gửi và đồng bộ kho nhận trước khi mở rộng phạm vi.",
  ],
  [
    "Xuất bán và hàng trả",
    "Các phân hệ liên quan có phối hợp giữ, trừ hoặc hoàn tồn tại WMS với bước ghi eBiz và xác nhận kết quả.",
    "Kiểm tra toàn bộ kênh bán/trả, lỗi giữa các bước và việc gửi lại; không để một kênh tiếp tục ghi tồn độc lập ngoài luồng.",
  ],
  [
    "PO nhập kho",
    "Hoàn tất PO có ghi nhận tăng tồn tại WMS và phần nhập chờ đối soát.",
    "Phải xác nhận đầy đủ đường ghi phiếu nhập eBiz và kết thúc phần chờ tương ứng. Chưa được coi thao tác Hoàn tất PO là bằng chứng đã đồng bộ nhập về eBiz.",
  ],
  [
    "Điều chỉnh sau kiểm kê",
    "Trong cấu hình mã nguồn đang rà soát, bước tự tạo phiếu nhập/xuất điều chỉnh eBiz đang tạm ngưng để kiểm thử.",
    "Nghiệm thu luồng điều chỉnh riêng trước khi thu hẹp quyền này. Hoàn tất hoặc ký kiểm kê không tự chứng minh tồn eBiz đã được sửa.",
  ],
  [
    "Danh mục kho, hàng và lô",
    "WMS sử dụng dữ liệu và định danh tích hợp với eBiz; chiều đồng bộ phụ thuộc từng loại dữ liệu.",
    "Chỉ định nơi quản lý dữ liệu gốc. Không giả định mọi thay đổi danh mục tại WMS đều tự ghi ngược về eBiz.",
  ],
];

const incidentRows = [
  [
    "Chưa gửi được lệnh",
    "Giữ phiếu ở trạng thái có thể theo dõi; kiểm tra kết nối và lỗi trước khi gửi lại theo đúng luồng.",
    "Người vận hành và bộ phận hỗ trợ",
  ],
  [
    "Đã gửi nhưng chưa biết eBiz có ghi hay không",
    "Giữ mã phiếu và mã giao dịch, ngừng thao tác lại cùng nghiệp vụ; tra cứu kết quả trên eBiz rồi xác nhận hoặc xử lý tiếp.",
    "Người phụ trách đối soát và IT",
  ],
  [
    "eBiz đã ghi, WMS chưa hoàn tất",
    "Kiểm tra chứng từ eBiz, khôi phục trạng thái và đối soát WMS. Không tạo thêm chứng từ chỉ để làm màn hình báo thành công.",
    "IT phối hợp người kiểm soát nghiệp vụ",
  ],
  [
    "Đọc tồn lỗi hoặc dữ liệu quá cũ",
    "Hiển thị thời điểm dữ liệu gần nhất; đánh giá rủi ro trước khi tiếp tục xuất/chuyển các dòng bị ảnh hưởng.",
    "Quản lý kho và IT",
  ],
  [
    "WMS gián đoạn, cần xử lý khẩn",
    "Kích hoạt ngoại lệ đã được phê duyệt, tạm dừng cùng nghiệp vụ trên WMS, ghi lại người thực hiện và chứng từ eBiz để đối soát sau phục hồi.",
    "Người được giao quyền ngoại lệ",
  ],
  [
    "Lỗi quyền hoặc tài khoản tích hợp",
    "Kiểm tra quyền và thông tin xác thực của tài khoản tích hợp. Không mở rộng quyền hàng loạt cho người dùng để vượt qua lỗi.",
    "Quản trị hệ thống và IT",
  ],
];

const rollout = [
  [
    "01",
    "Chốt phạm vi và số liệu ban đầu",
    "Liệt kê các nghiệp vụ, kho và công ty sẽ chuyển; xác định ai tạo, ai duyệt, ai đối soát. Đối chiếu tồn và các phiếu đang xử lý tại cùng một mốc trước khi bắt đầu.",
  ],
  [
    "02",
    "Thử nghiệm một phạm vi nhỏ",
    "Chọn một nghiệp vụ và nhóm kho đã đủ điều kiện. Đào tạo người dùng, chạy các tình huống thành công, từ chối, thiếu tồn, timeout, gửi lại và gián đoạn giữa các bước.",
  ],
  [
    "03",
    "Thu hẹp quyền ghi theo nghiệp vụ",
    "Sau khi nghiệm thu, giới hạn quyền ghi eBiz cho đúng nhóm người và nghiệp vụ đó. Giữ quyền xem cần thiết, tài khoản tích hợp và nhóm xử lý ngoại lệ.",
  ],
  [
    "04",
    "Theo dõi và mở rộng có điều kiện",
    "Kiểm tra phiếu treo, độ mới dữ liệu và sai lệch mỗi ngày trong giai đoạn đầu. Chỉ mở rộng khi số liệu giải thích được và quy trình khôi phục đã được thử.",
  ],
  [
    "05",
    "Quay lại có kiểm soát khi cần",
    "Nếu phải tạm vận hành trên eBiz, dừng luồng ghi tương ứng trên WMS trước. Ghi mốc chuyển giao và mọi chứng từ ngoại lệ; đối soát xong mới khôi phục quyền ghi tại WMS.",
  ],
];

const metrics = [
  [
    "Độ mới dữ liệu",
    "Thời điểm đọc eBiz thành công gần nhất theo công ty/kho; phân biệt nguồn đang lỗi với nguồn vừa cập nhật.",
  ],
  [
    "Giao dịch đang chờ",
    "Số phiếu và số lượng nhập/xuất chờ gửi hoặc chờ xác nhận; có tuổi chờ, người phụ trách và hành động tiếp theo.",
  ],
  [
    "Chênh lệch có thể giải thích",
    "Tách lượng chờ hợp lệ khỏi phần chênh lệch không gắn được chứng từ. Không gom cả hai thành một con số cảnh báo chung.",
  ],
  [
    "Chất lượng dữ liệu nguồn",
    "Số kho/lô bị thiếu, dòng trùng, mã không khớp hoặc số lượng bất thường sau mỗi lượt đồng bộ.",
  ],
  [
    "Giao dịch ngoại lệ",
    "Ai được mở quyền trực tiếp, xử lý nghiệp vụ nào, có chứng từ gì và đã đối soát xong hay chưa.",
  ],
  [
    "Khả năng phục hồi",
    "Thời gian xử lý sự cố, số phiếu Cần đối soát tồn đọng và kết quả thử phục hồi hàng đợi, dữ liệu, trạng thái.",
  ],
];

const questions = [
  [
    "Chuyển sang WMS có phải bỏ eBiz không?",
    "eBiz tiếp tục nhận các chứng từ thuộc luồng tích hợp đã được nghiệm thu, phục vụ tra cứu và các nghiệp vụ được phân công. Nhân sự kho chuyển điểm thao tác sang WMS; chiều và phạm vi đồng bộ phải được xác nhận cho từng nghiệp vụ.",
  ],
  [
    "Khi dùng WMS, có cần nhập lại phiếu trên eBiz không?",
    "Với nghiệp vụ đã tích hợp đầy đủ và đang áp dụng luồng WMS, không tạo lại cùng phiếu trên eBiz. Nếu chưa thấy dữ liệu, tra cứu trạng thái và nhờ đối soát bằng mã giao dịch thay vì tự lập phiếu mới.",
  ],
  [
    "Có cần khóa tất cả tài khoản eBiz?",
    "Không cần thu hồi đồng loạt quyền đăng nhập. Đề xuất tập trung vào quyền ghi tác động tồn; quyền xem, báo cáo, nghiệp vụ kế toán, tài khoản tích hợp và xử lý ngoại lệ được phân định theo công việc. Mức phân quyền thực hiện được còn phải xác nhận với hệ thống eBiz đang sử dụng.",
  ],
  [
    "Giới hạn thao tác eBiz có đảm bảo hết lệch tồn?",
    "Không thể cam kết như vậy. Cách này giảm một nguồn gây lệch là nhiều nơi cùng ghi, nhưng lỗi API, dữ liệu cũ, xác nhận sai thời điểm, giao dịch lặp, sai danh mục và chênh lệch hàng thực tế vẫn phải được xử lý.",
  ],
  [
    "Tại sao số khả dụng WMS thấp hơn tồn eBiz?",
    "Có thể WMS đang giữ hàng cho đơn hoặc có biến động chờ đối soát. Cần so cùng công ty, kho, SKU, lô, hạn dùng, đơn vị tính và thời điểm; đồng thời tách tồn ghi nhận khỏi tồn khả dụng.",
  ],
  [
    "Nếu API chỉ cho biết tổng tồn, có tự đối soát chính xác mọi trường hợp không?",
    "Một con số tổng chưa đủ để xác định một biến động đã bao gồm phiếu nào. Cần thông tin chứng từ, định danh giao dịch hoặc mốc dữ liệu phù hợp; đây là điều kiện tích hợp cần làm rõ với eBiz.",
  ],
  [
    "Đang gấp thì có thể tự vào eBiz sửa tồn không?",
    "Cần đi qua người được giao xử lý ngoại lệ. Phải ghi lý do, phê duyệt, mã chứng từ và tạm dừng luồng WMS tương ứng để tránh cùng ghi. Sau đó đối soát trước khi tiếp tục vận hành bình thường.",
  ],
];

export default function WmsEbizOperatingModelUpdateDetailPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title =
      "Vận hành kho qua WMS, giới hạn thao tác eBiz: lợi ích và đánh đổi | Picare Client";
    window.scrollTo(0, 0);
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="font-haffer min-h-screen overflow-x-hidden bg-[#120F17] text-white selection:bg-[#F86D2B] selection:text-white">
      <PublicLandingNavbar isDarkBg={isScrolled} showNoticeBanner={false} />
      <main className="mx-auto max-w-3xl px-4 pt-28 pb-32 sm:px-6 sm:pt-32 lg:pt-36">
        <Link
          to={PATHS.CHANGES}
          className="group inline-flex items-center gap-2 text-xs text-white/50 transition hover:text-white"
        >
          <FiArrowLeft
            aria-hidden="true"
            className="transition group-hover:-translate-x-1"
          />
          Quay lại danh sách cập nhật
        </Link>
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-8 border-b border-white/10 pb-8 sm:mt-10 sm:pb-10"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/45">
            <span className="text-[#FFA336]">
              Nổi bật · Định hướng vận hành
            </span>
            <span className="text-white/20">/</span>
            <time dateTime="2026-11-10">10 Tháng 11, 2026</time>
            <span className="text-white/20">/</span>
            <span>15 phút đọc</span>
          </div>
          <h1 className="mt-5 text-2xl leading-snug font-semibold text-white sm:text-3xl md:text-[38px]">
            Chuyển đổi phần mềm qua WMS & Giới hạn quyền trong eBiz
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
            Tập trung thao tác kho tại WMS, tiếp tục ghi nhận dữ liệu về eBiz
            theo các luồng đã tích hợp, đồng thời kiểm soát chênh lệch và xử lý
            sự cố. Bài viết dành cho nhân sự Kho, Kế toán, quản lý và đội triển
            khai hệ thống.
          </p>
        </motion.header>

        <article className="mt-8 space-y-12 text-sm leading-7 font-light text-zinc-300 sm:mt-12 sm:text-base">
          <Callout title="Phạm vi tài liệu" icon="shield">
            Đây là đề xuất mô hình vận hành và các điều kiện triển khai, chưa
            phải thông báo thu hồi quyền eBiz. Việc áp dụng cần được xác nhận
            theo từng nghiệp vụ; trạng thái tích hợp trong bài phản ánh phần mã
            nguồn được rà soát ngày 10/11/2026, không thay thế nghiệm thu môi
            trường thực tế.
          </Callout>
          <nav
            aria-label="Nội dung bài viết"
            className="border border-white/10 bg-white/[0.025] p-5"
          >
            <p className="mb-3 text-xs font-semibold text-[#FFA336]">
              TRONG BÀI NÀY
            </p>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              {contents.map(([id, label]) => (
                <a key={id} href={`#${id}`} className="hover:text-[#FFA336]">
                  {label}
                </a>
              ))}
            </div>
          </nav>

          <section id="mo-hinh" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="1"
              title="Thống nhất điểm thao tác và trách nhiệm dữ liệu"
            />
            <p>
              Khi một lô hàng có thể được nhập, xuất hoặc chuyển trực tiếp trên
              cả WMS và eBiz, hai người có thể cùng sử dụng một số tồn chưa kịp
              cập nhật. Một nghiệp vụ cũng có thể được nhập lại vì người dùng
              chưa thấy kết quả đồng bộ. Mục tiêu của đề xuất là đưa các thao
              tác kho đã đủ điều kiện về một luồng có kiểm tra, phê duyệt và
              truy vết tại WMS.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [
                  "WMS",
                  "Khởi tạo, phân quyền, kiểm tra hàng khả dụng và xử lý quy trình kho.",
                ],
                [
                  "Tích hợp",
                  "Gửi chứng từ bằng định danh có thể đối chiếu; theo dõi kết quả và các trường hợp chưa xác định.",
                ],
                [
                  "eBiz",
                  "Ghi nhận chứng từ của những nghiệp vụ đã tích hợp và phục vụ các tác vụ được phân công.",
                ],
                [
                  "Đối soát về WMS",
                  "Đọc lại dữ liệu eBiz, xác định phần đã phản ánh và xử lý các sai lệch còn tồn đọng.",
                ],
              ].map(([title, detail], index) => (
                <div
                  key={title}
                  className="border border-white/10 bg-white/[0.025] p-5"
                >
                  <div className="flex items-center justify-between text-[#FFA336]">
                    <span className="text-xs font-semibold">0{index + 1}</span>
                    <FiArrowRight aria-hidden="true" />
                  </div>
                  <h3 className="mt-3 font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
            <p>
              Mỗi nghiệp vụ cần chỉ định rõ nơi tạo giao dịch gốc, nơi kiểm soát
              hàng khả dụng và nơi xác nhận chứng từ. Với thao tác trực tiếp
              eBiz còn cần thiết, phải có người phụ trách và cơ chế đưa biến
              động đó vào quy trình đối soát chung.
            </p>
          </section>

          <section id="pham-vi" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="2"
              title="Giới hạn quyền ghi eBiz theo phạm vi công việc"
            />
            <p>
              Đối tượng cần kiểm soát là những quyền có thể làm thay đổi tồn:
              lập hoặc sửa phiếu nhập, xuất, chuyển kho, điều chỉnh và các chứng
              từ khác có tác động tương tự. Quyền xem, báo cáo và kế toán cần
              được tách theo nhiệm vụ. Trước khi cấu hình, xác nhận mức phân
              quyền thực tế mà eBiz đang sử dụng hỗ trợ.
            </p>
            <ArticleTable
              caption="Phân công đề xuất sau khi nghiệp vụ đã được nghiệm thu"
              headers={["Nhóm sử dụng", "Trên WMS", "Trên eBiz"]}
              rows={accessRows}
            />
            <p>
              Không dùng chung tài khoản cá nhân hoặc tài khoản tích hợp để xử
              lý mọi tình huống. Khi đổi nhân sự, thay vai trò hoặc có sự cố
              thông tin xác thực, cần rà soát lại quyền cả hai bên và trách
              nhiệm với các phiếu đang xử lý.
            </p>
          </section>

          <section id="du-lieu" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="3"
              title="Dữ liệu vẫn về eBiz, nhưng cần xác nhận đủ vòng"
            />
            <p>
              Trong mô hình mục tiêu, thao tác đã được chấp thuận tại WMS hoặc
              phân hệ được kết nối sẽ tạo chứng từ tương ứng về eBiz. WMS đọc
              kết quả trở lại để đối soát tồn. Tài khoản người dùng được giới
              hạn quyền ghi trực tiếp không làm mất quyền tích hợp của hệ thống
              khi hai nhóm quyền được cấu hình riêng.
            </p>
            <p>
              Thành công cần được theo dõi qua các mốc: phiếu hợp lệ, đã được
              phép xử lý, đã gửi, eBiz đã ghi nhận và dữ liệu tồn đã phản ánh
              giao dịch. Một bước thành công không tự chứng minh các bước phía
              sau đã xong. Với nghiệp vụ chưa có đủ vòng này, cần giữ phương án
              vận hành được kiểm soát đến khi nghiệm thu.
            </p>
            <Callout title="Không mặc định đồng bộ tức thời" icon="alert">
              Trong cấu hình đang rà soát, lượt đồng bộ tồn định kỳ được đặt 45
              phút/lần; một số thao tác có kích hoạt thêm lượt đồng bộ riêng.
              Đây không phải cam kết mọi giao dịch sẽ phản ánh ngay ở cả hai màn
              hình. Cần hiển thị độ mới dữ liệu và các phiếu đang chờ theo từng
              phạm vi.
            </Callout>
            <p>
              Nếu API chỉ cung cấp tổng tồn và không có chứng từ hoặc mốc dữ
              liệu phù hợp, việc phân biệt giao dịch đã được tính vào bản dữ
              liệu tồn sẽ khó hơn. Cần làm rõ giới hạn này với phía tích hợp,
              thay vì suy đoán từ việc tổng số lượng vừa tăng hoặc giảm.
            </p>
          </section>

          <section id="loi-ich" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="4"
              title="Lợi ích và những đánh đổi phải chấp nhận"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <PointList title="Lợi ích kỳ vọng" items={benefits} positive />
              <PointList
                title="Hạn chế và chi phí vận hành"
                items={tradeoffs}
              />
            </div>
            <p>
              Lợi ích phụ thuộc vào độ hoàn thiện của tích hợp, phạm vi quyền
              được kiểm soát và việc các bộ phận tuân thủ quy trình. Nên đo hiệu
              quả qua số giao dịch trùng, phiếu treo, thời gian đối soát và phần
              chênh lệch chưa giải thích được, thay vì chỉ đếm số người đã
              chuyển sang WMS.
            </p>
          </section>

          <section id="lech-ton" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="5"
              title="Giới hạn quyền chưa đủ để ngăn mọi trường hợp lệch tồn"
            />
            <ArticleTable
              caption="Các rủi ro cần kiểm soát song song với phân quyền"
              headers={["Tình huống", "Nguyên nhân", "Hướng kiểm soát"]}
              rows={riskRows}
            />
            <div className="border border-white/10 bg-white/[0.025] p-5">
              <h3 className="font-semibold text-white">
                Ví dụ: khác số chưa chắc là lệch
              </h3>
              <p className="mt-3">
                eBiz và tồn ghi nhận WMS cùng có 100 sản phẩm. WMS đang giữ 20
                sản phẩm cho đơn, nên tồn khả dụng là 80. Hai số 100 và 80 mô tả
                hai ý nghĩa khác nhau.
              </p>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[
                  ["Tồn ghi nhận", "100"],
                  ["Đang giữ", "20"],
                  ["Khả dụng", "80"],
                ].map(([label, value]) => (
                  <div key={label} className="border border-white/10 p-3">
                    <dt className="text-xs text-zinc-400">{label}</dt>
                    <dd className="mt-2 text-xl font-semibold text-[#FFA336]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm text-zinc-400">
                Cần so cùng công ty, kho, SKU, lô, hạn dùng, đơn vị tính và thời
                điểm, đồng thời tách lượng giữ hàng khỏi biến động chờ đối soát.
              </p>
            </div>
            <p>
              Ngược lại, nếu WMS nhập 20 từ mốc 100 và vẫn giữ phần nhập chờ xác
              nhận, trong khi eBiz đã ghi cùng giao dịch và trả tồn 120, việc
              cộng lại 20 có thể thành 140. Với xuất hàng, tình huống tương tự
              có thể làm trừ hai lần. Đây là ví dụ minh họa cho yêu cầu đối soát
              theo giao dịch, không phải số liệu thực tế của một kho.
            </p>
            <p>
              Hai hệ thống cùng hiển thị một số sai vẫn có thể khác hàng thực
              tế. Kiểm kê, kiểm soát giao nhận và ghi nhận hàng hỏng/mất tiếp
              tục là phần bắt buộc của vận hành kho.
            </p>
          </section>

          <section id="san-sang" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="6"
              title="Nghiệm thu từng nghiệp vụ trước khi thu hẹp quyền"
            />
            <p>
              Không áp dụng một kết luận sẵn sàng cho toàn bộ WMS. Phạm vi đang
              rà soát có các luồng hoàn thiện ở mức khác nhau; người phụ trách
              cần xác nhận lại trên môi trường triển khai và dữ liệu thực tế.
            </p>
            <ArticleTable
              caption="Những điểm cần xác nhận trước khi chuyển hẳn thao tác về WMS"
              headers={[
                "Nghiệp vụ",
                "Phạm vi đã ghi nhận khi rà soát",
                "Điều kiện trước khi áp dụng",
              ]}
              rows={readinessRows}
            />
            <Link
              to={PATHS.WAREHOUSE_TRANSFER_GUIDE}
              className="inline-flex items-center gap-2 text-sm text-[#FFA336] underline underline-offset-4 hover:text-white"
            >
              <FiExternalLink aria-hidden="true" />
              Xem hướng dẫn chuyển kho và chọn người duyệt
            </Link>
          </section>

          <section id="su-co" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="7"
              title="Quy trình xử lý sự cố và thao tác ngoại lệ"
            />
            <ArticleTable
              caption="Xử lý theo mức độ chắc chắn về kết quả giao dịch"
              headers={["Sự cố", "Cách xử lý", "Người phối hợp"]}
              rows={incidentRows}
            />
            <Callout title="Timeout là kết quả chưa xác định" icon="alert">
              Lỗi kết nối sau khi gửi không đủ để kết luận eBiz chưa ghi phiếu.
              Trước khi gửi lại, cần tra cứu bằng định danh giao dịch. Với
              chuyển kho, trạng thái Cần đối soát là tín hiệu để kiểm tra kết
              quả trước khi tạo phiếu thay thế.
            </Callout>
            <p>
              Một hồ sơ ngoại lệ cần có: lý do, phạm vi công ty/kho, nghiệp vụ
              bị ảnh hưởng, người phê duyệt, người thao tác, thời điểm, mã chứng
              từ eBiz và kết quả đối soát sau xử lý. Nếu phải cấp quyền tạm, cần
              có thời hạn và người chịu trách nhiệm thu hồi.
            </p>
          </section>

          <section id="lo-trinh" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="8"
              title="Chuyển đổi theo từng phạm vi có kiểm soát"
            />
            <div className="space-y-3">
              {rollout.map(([number, title, description]) => (
                <div
                  key={number}
                  className="grid gap-3 border border-white/10 bg-white/[0.025] p-5 sm:grid-cols-[40px_1fr]"
                >
                  <span className="text-sm font-semibold text-[#FFA336]">
                    {number}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p>
              Trong thời gian thử nghiệm, có thể đối chiếu song song trên hai hệ
              thống, nhưng mỗi nghiệp vụ phải có một nơi được giao quyền ghi.
              Khi quay lại eBiz để xử lý sự cố, cần chốt và đối soát các phiếu
              đang chờ thay vì mở đồng thời cả hai luồng ghi.
            </p>
          </section>

          <section id="doi-soat" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="9"
              title="Theo dõi chất lượng vận hành sau chuyển đổi"
            />
            <ArticleTable
              caption="Bộ chỉ số đề xuất cho quản lý và đối soát"
              headers={["Nhóm chỉ số", "Nội dung cần theo dõi"]}
              rows={metrics}
            />
            <p>
              Ngưỡng cảnh báo về tuổi dữ liệu, thời gian chờ và mức chênh lệch
              cần được chốt theo nghiệp vụ, thay vì áp dụng một ngưỡng chung cho
              mọi kho. Lỗi ở một công ty hoặc kho phải được hiển thị rõ, kể cả
              khi các nguồn khác vừa đồng bộ thành công.
            </p>
            <p>
              Trước khi mở rộng, cần chứng minh được các trường hợp: giao dịch
              hợp lệ ghi đúng một lần; lỗi rõ ràng không làm sai tồn; kết quả
              chưa xác định được đưa đi đối soát; dữ liệu đọc thiếu không làm
              mất tồn; nhân sự biết người cần liên hệ khi xảy ra sự cố.
            </p>
          </section>

          <section id="cau-hoi" className="scroll-mt-28 space-y-5">
            <SectionHeading number="10" title="Câu hỏi thường gặp" />
            <div className="space-y-3">
              {questions.map(([question, answer]) => (
                <details
                  key={question}
                  className="group border border-white/10 bg-white/[0.025] p-5"
                >
                  <summary className="cursor-pointer text-sm font-semibold text-white focus-visible:outline focus-visible:outline-[#FFA336]">
                    {question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </article>
        <div className="mt-14 border-t border-white/10 pt-7">
          <Link
            to={PATHS.CHANGES}
            className="inline-flex items-center gap-2 text-sm text-[#FFA336] transition hover:text-white"
          >
            <FiArrowLeft aria-hidden="true" />
            Xem các bài cập nhật khác
          </Link>
        </div>
      </main>
      <PublicLandingFooter />
    </div>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <h2 className="flex items-start gap-3 text-lg font-semibold text-white sm:text-xl">
      <span className="shrink-0 text-sm leading-7 text-[#FFA336]">
        {number}.
      </span>
      {title}
    </h2>
  );
}

function ArticleTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-white/10"
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className="w-full min-w-[620px] border-collapse text-left text-sm">
        <caption className="border-b border-white/10 bg-white/[0.025] px-4 py-3 text-left text-xs leading-5 text-zinc-400">
          {caption}
        </caption>
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.04]">
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-3 align-top font-semibold text-white"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) =>
                index === 0 ? (
                  <th
                    key={index}
                    scope="row"
                    className="w-[22%] px-4 py-4 align-top font-medium text-white"
                  >
                    {cell}
                  </th>
                ) : (
                  <td
                    key={index}
                    className="px-4 py-4 align-top leading-6 text-zinc-400"
                  >
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PointList({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[][];
  positive?: boolean;
}) {
  const Icon = positive ? FiCheckCircle : FiAlertTriangle;
  return (
    <div className="border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center gap-2 text-[#FFA336]">
        <Icon aria-hidden="true" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ul className="mt-5 space-y-5">
        {items.map(([label, description]) => (
          <li key={label}>
            <h4 className="text-sm font-semibold text-white">{label}</h4>
            <p className="mt-1 text-sm leading-6 text-zinc-400">
              {description}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Callout({
  title,
  icon,
  children,
}: {
  title: string;
  icon: "shield" | "alert";
  children: ReactNode;
}) {
  const Icon = icon === "shield" ? FiShield : FiAlertTriangle;
  return (
    <aside className="border-l-2 border-[#F86D2B] bg-white/[0.025] p-5">
      <div className="flex items-start gap-3">
        <Icon
          aria-hidden="true"
          className="mt-1 h-4 w-4 shrink-0 text-[#FFA336]"
        />
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <div className="mt-2 text-sm leading-7 text-zinc-300">{children}</div>
        </div>
      </div>
    </aside>
  );
}
