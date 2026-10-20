import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiHelpCircle,
  FiInfo,
  FiLayers,
  FiPaperclip,
  FiPenTool,
  FiSend,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import CinematicVideoModal from "@/components/custom_ui/CinematicVideoModal";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import { PATHS } from "@/config/paths";

const PAYMENT_REQUEST_VIDEO_URL =
  "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1792492998384_ad88a38b-a481-4134-b1c3-bd892dbce38c_paymentreq1.mp4";

const FORM_TYPES = [
  {
    code: "PAYMENT_REQUEST",
    name: "Đề nghị thanh toán",
    badge: "Phổ biến nhất",
    description:
      "Áp dụng khi thanh toán chi phí phát sinh, chi phí vận hành, công nợ nhà cung cấp hoặc dịch vụ có bảng kê hóa đơn chứng từ kèm theo.",
  },
  {
    code: "ADVANCE_REQUEST",
    name: "Đề nghị tạm ứng",
    badge: "Tạm ứng trước",
    description:
      "Áp dụng cho nhân viên cần tạm ứng kinh phí công tác, mua hàng gấp hoặc triển khai công việc trước khi có hóa đơn; kèm cam kết thời hạn hoàn ứng.",
  },
  {
    code: "SUPPLEMENTAL_PAYMENT_REQUEST",
    name: "Đề nghị thanh toán bổ sung",
    badge: "Hoàn ứng / Chi bù",
    description:
      "Áp dụng khi quyết toán phần chênh lệch thực tế sau tạm ứng: hoàn lại tiền thừa cho công ty hoặc công ty chi bổ sung phần phát sinh vượt mức.",
  },
];

const CREATION_STEPS = [
  {
    number: "01",
    title: "Chọn biểu mẫu đề nghị tài chính",
    description:
      "Truy cập phân hệ Tài chính, chọn mẫu phù hợp: Đề nghị thanh toán, Đề nghị tạm ứng hoặc Thanh toán bổ sung.",
    icon: FiLayers,
  },
  {
    number: "02",
    title: "Thông tin người nhận & Ngân hàng",
    description:
      "Chọn pháp nhân công ty; nhập thông tin thụ hưởng và tra cứu chọn nhanh ngân hàng qua mạng lưới VietQR liên kết.",
    icon: FiCreditCard,
  },
  {
    number: "03",
    title: "Bảng kê hóa đơn & Tính toán tiền tệ",
    description:
      "Kê khai từng dòng chi phí với số hóa đơn, ngày lập và số tiền. Hệ thống tự động cộng dồn và đọc tiền thành chữ chuẩn xác.",
    icon: FiDollarSign,
  },
  {
    number: "04",
    title: "Tải chứng từ hóa đơn kế toán",
    description:
      "Đính kèm hóa đơn VAT, biên lai chuyển khoản hoặc hợp đồng/báo giá dưới định dạng PDF hoặc ảnh chụp chất lượng cao.",
    icon: FiPaperclip,
  },
  {
    number: "05",
    title: "Lưu nháp & Gửi luồng ký duyệt",
    description:
      "Xem trước biểu mẫu A4, lưu nháp (Draft) hoặc gửi duyệt (Submit) vào ma trận phê duyệt đa cấp theo hạn mức công ty.",
    icon: FiSend,
  },
];

const APPROVAL_ROLES = [
  {
    role: "Người đề nghị (Requester)",
    detail:
      "Khởi tạo hồ sơ, kiểm tra tính đầy đủ của thông tin và ký xác nhận khởi tạo ban đầu (tự động gắn chữ ký số cá nhân đã lưu).",
  },
  {
    role: "Trưởng phòng / Quản lý (Manager)",
    detail:
      "Xem xét nhu cầu thực tế của nghiệp vụ phát sinh và phê duyệt chủ trương chi tiêu trong phạm vi ngân sách bộ phận phụ trách.",
  },
  {
    role: "Kế toán thanh toán (Accountant)",
    detail:
      "Đối soát tính pháp lý của hóa đơn VAT, chứng từ gốc, số tài khoản thụ hưởng và các điều khoản thanh toán liên quan.",
  },
  {
    role: "Kế toán trưởng (Chief Accountant)",
    detail:
      "Thẩm định định mức tài chính, cân đối dòng tiền công ty và xác nhận tính hợp lệ của toàn bộ hồ sơ kế toán trước khi chi trả.",
  },
  {
    role: "Ban Giám đốc (Director)",
    detail:
      "Phê duyệt quyết định chi tiền cuối cùng đối với các khoản thanh toán theo phân cấp hạn mức thẩm quyền của Picare Group.",
  },
];

const APPROVAL_STATUSES = [
  {
    name: "Bản nháp (DRAFT)",
    badgeColor: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    description:
      "Đơn đã được lưu lại với mã định danh riêng; người tạo có thể quay lại chỉnh sửa dữ liệu hoặc xóa đơn bất kỳ lúc nào.",
  },
  {
    name: "Chờ duyệt (PENDING)",
    badgeColor: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    description:
      "Đơn đã được gửi vào luồng ký; đang chờ các vị trí được phân công lần lượt xem xét và thực hiện ký duyệt điện tử.",
  },
  {
    name: "Đã duyệt (APPROVED)",
    badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    description:
      "Toàn bộ các cấp duyệt bắt buộc đã hoàn tất ký; hệ thống tự động kết xuất văn bản PDF chính thức lưu trữ đầy đủ chữ ký số.",
  },
  {
    name: "Từ chối (REJECTED / RETURNED)",
    badgeColor: "border-rose-500/30 text-rose-400 bg-rose-500/10",
    description:
      "Đơn bị từ chối phê duyệt bởi một trong các cấp ký duyệt kèm theo lý do cụ thể hiển thị minh bạch trên lịch sử xử lý.",
  },
  {
    name: "Đã thanh toán (PAID)",
    badgeColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    description:
      "Bộ phận Kế toán - Thủ quỹ đã hoàn tất chuyển tiền/chi trả thực tế và xác nhận có đầy đủ chứng từ thanh toán lưu trữ.",
  },
];

const FAQS = [
  {
    question: "Làm thế nào để tạo chữ ký số trước khi lên đơn?",
    answer:
      "Bạn chỉ cần vào mục Hồ sơ cá nhân (Profile) hoặc thực hiện theo quy trình kích hoạt tài khoản Picare Office để vẽ trực tiếp hoặc tải lên ảnh chữ ký cá nhân. Khi gửi đơn hoặc phê duyệt, hệ thống sẽ tự động sử dụng chữ ký này gắn vào chứng từ.",
  },
  {
    question: "Tôi có thể lưu bản nháp và tiếp tục điền sau được không?",
    answer:
      "Hoàn toàn được. Bấm nút 'Lưu nháp' trên thanh điều hướng nổi (Floating Dock). Đơn sẽ được cấp một mã số riêng (ví dụ: DNTT-202610-0001) và lưu trong danh mục Tài chính, cho phép bạn chỉnh sửa hoặc bổ sung hóa đơn bất cứ lúc nào trước khi gửi duyệt.",
  },
  {
    question: "Hệ thống hỗ trợ đính kèm những định dạng tệp nào?",
    answer:
      "Hệ thống hỗ trợ đầy đủ các định dạng tài liệu phổ biến: PDF, PNG, JPG, WEBP với dung lượng lên đến 50 MB mỗi tệp. Bạn có thể xem trước tệp trực tiếp trên giao diện hoặc thay đổi tệp nhanh chóng nếu có nhầm lẫn.",
  },
  {
    question: "Nếu đơn bị Từ chối thì tôi cần làm gì?",
    answer:
      "Khi đơn bị từ chối, bạn sẽ nhận được thông báo kèm lý do từ chối từ người phụ trách duyệt (ví dụ: thiếu hóa đơn VAT, sai thông tin tài khoản thụ hưởng). Bạn có thể kiểm tra mục Lịch sử xử lý, điều chỉnh lại dữ liệu hoặc tạo đơn đề nghị mới.",
  },
  {
    question: "Làm sao để biết đơn của tôi cần những cấp nào phê duyệt?",
    answer:
      "Khi bấm 'Gửi duyệt', hệ thống tự động hiển thị hộp thoại xác nhận mô phỏng đầy đủ luồng ký duyệt dự kiến (Người đề nghị → Trưởng phòng → Kế toán thanh toán → Kế toán trưởng → Ban Giám đốc) dựa trên loại biểu mẫu, công ty và hạn mức số tiền của đơn.",
  },
];

export default function PaymentRequestGuideUpdateDetailPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModalVideo, setActiveModalVideo] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      "Hướng dẫn tạo đơn và quy trình ký duyệt đề nghị thanh toán | Picare Client";

    const lenis = new Lenis({
      lerp: 0.075,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.6,
      smoothWheel: true,
      autoRaf: false,
    });
    const updateTicker = (time: number) => lenis.raf(time * 1000);
    const handleLenisScroll = (event: { scroll: number }) => {
      setIsScrolled(event.scroll > 40);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", handleLenisScroll);

    return () => {
      document.title = "Picare Client";
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="font-haffer min-h-screen overflow-x-hidden bg-[#120F17] text-white selection:bg-[#F86D2B] selection:text-white">
      <PublicLandingNavbar isDarkBg={isScrolled} showNoticeBanner={false} />

      <main className="mx-auto max-w-3xl px-4 pt-28 pb-32 sm:px-6 sm:pt-32 lg:pt-36">
        {/* Navigation quay lại */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to={PATHS.CHANGES}
            className="group inline-flex items-center gap-2 text-xs font-normal text-white/50 transition hover:text-white"
          >
            <FiArrowLeft
              aria-hidden="true"
              className="transition group-hover:-translate-x-1"
            />
            Quay lại danh sách cập nhật
          </Link>
        </motion.div>

        {/* Header bài viết */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 border-b border-white/10 pb-8 sm:mt-10 sm:pb-10"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/45">
            <span className="font-semibold text-[#FFA336]">Tính năng mới</span>
            <span className="text-white/20">/</span>
            <time dateTime="2026-10-20">20 Tháng 10, 2026</time>
            <span className="text-white/20">/</span>
            <span>6 phút đọc</span>
          </div>
          <h1 className="mt-5 text-2xl leading-snug font-semibold text-white sm:text-3xl md:text-[38px]">
            Hướng dẫn tạo đơn và quy trình ký duyệt đề nghị thanh toán
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Hướng dẫn toàn diện cho nhân viên và các cấp quản lý tại Picare
            Office: từ cách chọn mẫu biểu phù hợp, kê khai hóa đơn chi phí,
            tải chứng từ thanh toán đến ký duyệt số và theo dõi hồ sơ tài chính
            chuẩn doanh nghiệp.
          </p>
        </motion.header>

        {/* Nội dung bài viết */}
        <article className="mt-8 space-y-12 text-sm leading-7 font-light text-zinc-300 sm:mt-12 sm:text-base">
          {/* Tóm tắt nhanh */}
          <div className="border-l-2 border-[#F86D2B] pl-4 text-sm leading-7 text-zinc-300 sm:pl-5 sm:text-[15px]">
            <strong className="font-semibold text-white">Xem nhanh:</strong> Chọn
            biểu mẫu tài chính → Kê khai người nhận & ngân hàng (VietQR) → Nhập
            chi tiết chi phí hóa đơn → Đính kèm chứng từ → Ký số & Gửi duyệt
            vào luồng phê duyệt đa cấp.
          </div>

          {/* Mục lục bài viết */}
          <nav
            aria-label="Nội dung bài viết"
            className="border border-white/10 bg-white/[0.025] p-5"
          >
            <p className="mb-3 text-xs font-semibold tracking-wider text-[#FFA336]">
              TRONG BÀI NÀY
            </p>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <a className="hover:text-[#FFA336]" href="#cac-loai-bieu-mau">
                1. Các loại biểu mẫu tài chính
              </a>
              <a className="hover:text-[#FFA336]" href="#quy-trinh-5-buoc">
                2. Quy trình 5 bước lên đơn duyệt
              </a>
              <a className="hover:text-[#FFA336]" href="#video-huong-dan">
                3. Video hướng dẫn thao tác thực tế
              </a>
              <a className="hover:text-[#FFA336]" href="#ma-tran-ky-duyet">
                4. Ma trận & Vai trò các cấp ký duyệt
              </a>
              <a className="hover:text-[#FFA336]" href="#trang-thai-va-faq">
                5. Trạng thái đơn & Câu hỏi thường gặp
              </a>
            </div>
          </nav>

          {/* Mục 1: Các loại biểu mẫu tài chính */}
          <section id="cac-loai-bieu-mau" className="scroll-mt-28 space-y-5">
            <SectionHeading number="1" title="Các loại biểu mẫu tài chính tại Picare Office" />
            <p>
              Nhằm chuẩn hóa công tác quản lý tài chính và hỗ trợ việc lập đề
              xuất nhanh chóng, phân hệ Tài chính cung cấp sẵn 3 nhóm biểu mẫu
              chuyên biệt:
            </p>
            <div className="space-y-3">
              {FORM_TYPES.map((form) => (
                <div
                  key={form.code}
                  className="border border-white/10 bg-white/[0.025] p-5 transition-colors hover:border-white/20"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-white">
                      {form.name}
                    </h3>
                    <span className="rounded-full border border-[#FFA336]/30 bg-[#FFA336]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#FFA336]">
                      {form.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {form.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Mục 2: 5 bước lên đơn duyệt */}
          <section id="quy-trinh-5-buoc" className="scroll-mt-28 space-y-5">
            <SectionHeading number="2" title="Quy trình 5 bước lên đơn đề nghị thanh toán" />
            <p>
              Giao diện tạo đơn được thiết kế trực quan, khoa học giúp người dùng
              dễ dàng thao tác qua 5 bước:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {CREATION_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="border border-white/10 bg-white/[0.025] p-5 transition-colors hover:border-white/20"
                  >
                    <div className="flex items-center justify-between text-[#FFA336]">
                      <span className="text-xs font-semibold">
                        BƯỚC {step.number}
                      </span>
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-5 pt-2">
              <div>
                <h3 className="font-semibold text-white">
                  Bước 1: Chọn pháp nhân công ty & Tự động điền người đề nghị
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Chọn công ty thành viên trực thuộc Picare Group mà bạn đang phát
                  sinh nghiệp vụ chi phí. Hệ thống sẽ tự động đồng bộ họ tên,
                  phòng ban và chức vụ từ hồ sơ người dùng đã được định danh trên
                  Picare Office, giúp loại bỏ hoàn toàn việc gõ tay thủ công.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Bước 2: Cung cấp thông tin thanh toán & Thụ hưởng
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Điền tên người/đơn vị nhận thanh toán. Lựa chọn hình thức
                  chuyển khoản hoặc tiền mặt. Với hình thức chuyển khoản, hệ
                  thống tích hợp danh bạ VietQR với hơn 50 ngân hàng thương mại
                  giúp tìm kiếm và chọn nhanh tên ngân hàng, giảm thiểu sai sót
                  số tài khoản thụ hưởng.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Bước 3: Kê khai bảng hóa đơn & Tự động đọc số tiền
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Thêm các dòng chi phí tương ứng: Ngày hóa đơn, Số hóa đơn GTGT,
                  Nội dung diễn giải và Số tiền (VND). Hệ thống sẽ tự động cộng
                  tổng tiền, chuyển đổi thành số tiền bằng chữ tiếng Việt chuẩn xác
                  và tự động trừ khoản tạm ứng đã nhận (nếu có) để tính số tiền
                  thanh toán thực tế.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Bước 4: Đính kèm hóa đơn điện tử & Tài liệu chứng từ
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Tải lên tệp hóa đơn VAT (PDF hoặc hình ảnh) và các tài liệu liên
                  quan (hợp đồng, đề xuất, biên bản nghiệm thu). Bạn có thể xem
                  trực tiếp chứng từ đã tải lên, đổi tệp hoặc gỡ bỏ tệp nếu có sai
                  sót.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Bước 5: Xem trước biểu mẫu A4 & Gửi luồng ký duyệt
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Bảng xem trước tài liệu A4 chuẩn doanh nghiệp hiển thị đầy đủ
                  tiêu ngữ, mã đơn, bảng kê chi phí và các khung chữ ký. Sử dụng
                  thanh công cụ nổi (Floating Dock) ở góc dưới để bấm{" "}
                  <strong className="text-white font-medium">Lưu nháp (Draft)</strong> nếu
                  chưa muốn gửi ngay, hoặc bấm{" "}
                  <strong className="text-white font-medium">Gửi duyệt (Submit)</strong> để
                  chuyển tiếp đơn đến các cấp phê duyệt.
                </p>
              </div>
            </div>
          </section>

          {/* Mục 3: Video hướng dẫn */}
          <section id="video-huong-dan" className="scroll-mt-28 space-y-5">
            <SectionHeading number="3" title="Video hướng dẫn thao tác thực tế" />
            <p>
              Theo dõi chi tiết toàn bộ các thao tác từng bước từ chọn mẫu, điền
              thông tin, tải chứng từ đến gửi duyệt và ký số qua video thực tế
              dưới đây:
            </p>

            <VideoPreviewCard
              videoSrc={PAYMENT_REQUEST_VIDEO_URL}
              caption="Video hướng dẫn thực tế quy trình tạo và gửi duyệt đơn đề nghị thanh toán trên Picare Office."
              onOpenModal={() => setActiveModalVideo(PAYMENT_REQUEST_VIDEO_URL)}
            />
          </section>

          {/* Mục 4: Ma trận ký duyệt */}
          <section id="ma-tran-ky-duyet" className="scroll-mt-28 space-y-5">
            <SectionHeading number="4" title="Ma trận & Vai trò các cấp trong quy trình ký duyệt" />
            <p>
              Để đảm bảo tính minh bạch và bảo vệ an toàn ngân sách công ty,
              mỗi đơn đề nghị đều trải qua luồng thẩm định tuần tự theo ma trận
              phân quyền:
            </p>
            <div className="space-y-3">
              {APPROVAL_ROLES.map((role) => (
                <RoleRow
                  key={role.role}
                  role={role.role}
                  detail={role.detail}
                />
              ))}
            </div>
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <InfoCard title="Tự động ký cho người tạo" icon={FiPenTool}>
                Khi bấm Gửi duyệt, hệ thống sẽ tự động ký xác nhận cho Người đề
                nghị nếu tài khoản đã có chữ ký cá nhân, giúp tiết kiệm thời gian
                thao tác.
              </InfoCard>
              <InfoCard title="Tự động sinh PDF chứng từ" icon={FiFileText}>
                Khi tất cả các cấp phê duyệt hoàn tất ký, hệ thống sẽ tự động
                tổng hợp toàn bộ chữ ký điện tử vào tệp PDF lưu trữ chính thức
                sẵn sàng để in ấn hoặc kiểm toán.
              </InfoCard>
            </div>
          </section>

          {/* Mục 5: Trạng thái & FAQ */}
          <section id="trang-thai-va-faq" className="scroll-mt-28 space-y-5">
            <SectionHeading number="5" title="Trạng thái đơn & Câu hỏi thường gặp" />
            <p>
              Theo dõi trạng thái tiến trình xử lý hồ sơ qua các mốc vòng đời:
            </p>
            
            <div className="divide-y divide-white/10 border border-white/10">
              {APPROVAL_STATUSES.map((status) => (
                <div
                  key={status.name}
                  className="grid gap-1 px-5 py-4 sm:grid-cols-[210px_1fr] sm:gap-4"
                >
                  <div>
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-semibold ${status.badgeColor}`}
                    >
                      {status.name}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-400">
                    {status.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <h3 className="font-semibold text-white">Câu hỏi thường gặp</h3>
              {FAQS.map((item) => (
                <div
                  key={item.question}
                  className="border border-white/10 bg-white/[0.025] p-5"
                >
                  <h4 className="flex items-start gap-2.5 text-sm font-semibold text-white">
                    <FiHelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FFA336]" />
                    <span>{item.question}</span>
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-zinc-400 pl-6.5">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Hỗ trợ kỹ thuật */}
          <div className="flex items-start gap-3 border-l-2 border-[#F86D2B] bg-white/[0.025] p-5 text-sm leading-6 text-zinc-300">
            <FiInfo
              aria-hidden="true"
              className="mt-1 h-4 w-4 shrink-0 text-[#FFA336]"
            />
            <p>
              Nếu gặp bất kỳ khó khăn nào trong quá trình nhập liệu, đính kèm
              hóa đơn hoặc luồng ký duyệt, vui lòng liên hệ ngay bộ phận Kế toán
              hoặc IT Picare Vietnam để được hỗ trợ kịp thời.
            </p>
          </div>
        </article>

        {/* Footer chuyển hướng */}
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

      {/* Component Transition Video Cinematic toàn màn hình */}
      <CinematicVideoModal
        isOpen={Boolean(activeModalVideo)}
        onClose={() => setActiveModalVideo(null)}
        videoSrc={activeModalVideo || ""}
      />

      <PublicLandingFooter />
    </div>
  );
}

function VideoPreviewCard({
  videoSrc,
  caption,
  onOpenModal,
}: {
  videoSrc: string;
  caption: string;
  onOpenModal: () => void;
}) {
  const cardOverlayRef = useRef<HTMLDivElement>(null);
  const cardLogoRef = useRef<HTMLDivElement>(null);
  const cardHelperRef = useRef<HTMLParagraphElement>(null);

  const handleCardMouseEnter = () => {
    if (!cardOverlayRef.current) return;
    gsap.killTweensOf([
      cardOverlayRef.current,
      cardLogoRef.current,
      cardHelperRef.current,
    ]);

    const tl = gsap.timeline();
    tl.to(
      cardOverlayRef.current,
      { opacity: 1, duration: 0.35, ease: "power2.out" },
      0,
    );

    if (cardLogoRef.current) {
      tl.fromTo(
        cardLogoRef.current,
        { scale: 0.9, y: 8, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
        0.05,
      );
    }

    if (cardHelperRef.current) {
      tl.fromTo(
        cardHelperRef.current,
        { y: 6, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
        0.1,
      );
    }
  };

  const handleCardMouseLeave = () => {
    if (!cardOverlayRef.current) return;
    gsap.killTweensOf([
      cardOverlayRef.current,
      cardLogoRef.current,
      cardHelperRef.current,
    ]);

    const tl = gsap.timeline();
    if (cardHelperRef.current) {
      tl.to(
        cardHelperRef.current,
        { y: 4, opacity: 0, duration: 0.2, ease: "power2.in" },
        0,
      );
    }
    if (cardLogoRef.current) {
      tl.to(
        cardLogoRef.current,
        { scale: 0.92, y: 6, opacity: 0, duration: 0.22, ease: "power2.in" },
        0,
      );
    }
    tl.to(
      cardOverlayRef.current,
      { opacity: 0, duration: 0.25, ease: "power2.in" },
      0.05,
    );
  };

  return (
    <figure className="my-8 space-y-3 sm:my-10">
      <div
        onClick={onOpenModal}
        onMouseEnter={handleCardMouseEnter}
        onMouseLeave={handleCardMouseLeave}
        className="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#0e0b13] shadow-[0_24px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(248,109,43,0.12)] transition-all duration-500 hover:border-white/25 hover:shadow-[0_28px_90px_rgba(0,0,0,0.95),0_0_70px_rgba(248,109,43,0.28)] sm:rounded-2xl"
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 z-30 h-px bg-gradient-to-r from-transparent via-[#F86D2B]/60 to-transparent" />

        <div className="relative aspect-video w-full overflow-hidden bg-black/50">
          <video
            src={videoSrc}
            playsInline
            autoPlay
            muted
            loop
            preload="metadata"
            className="h-full w-full object-cover select-none"
          />
        </div>

        <div
          ref={cardOverlayRef}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 px-6 opacity-0 backdrop-blur-[3px]"
        >
          <div
            ref={cardLogoRef}
            className="flex flex-col items-center justify-center opacity-0"
          >
            <img
              src={logoPicareNewBlack}
              alt="Picare Client"
              className="h-10 w-auto object-contain mix-blend-screen drop-shadow-[0_8px_32px_rgba(248,109,43,0.45)] sm:h-14 md:h-16"
            />
          </div>

          <p
            ref={cardHelperRef}
            className="font-haffer mt-1 text-[11px] font-normal text-zinc-300 opacity-0 sm:text-xs"
          >
            Nhấn để xem video toàn màn hình
          </p>
        </div>
      </div>

      <figcaption className="text-center text-xs font-light text-zinc-400">
        {caption}
      </figcaption>
    </figure>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-semibold text-white sm:text-xl">
      <span className="text-sm text-[#FFA336]">{number}.</span>
      {title}
    </h2>
  );
}

function InfoCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof FiFileText;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.025] p-5">
      <Icon aria-hidden="true" className="h-5 w-5 text-[#FFA336]" />
      <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{children}</p>
    </div>
  );
}

function RoleRow({ role, detail }: { role: string; detail: string }) {
  return (
    <div className="grid gap-1 border-b border-white/10 pb-3 sm:grid-cols-[210px_1fr] sm:gap-4">
      <strong className="text-sm font-semibold text-white">{role}</strong>
      <p className="text-sm leading-6 text-zinc-400">{detail}</p>
    </div>
  );
}
