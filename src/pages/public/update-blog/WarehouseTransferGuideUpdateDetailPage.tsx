import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBell,
  FiCheckCircle,
  FiFileText,
  FiPackage,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import CinematicVideoModal from "@/components/custom_ui/CinematicVideoModal";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import { PATHS } from "@/config/paths";

const TRANSFER_VIDEO_URL =
  "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1794287543305_334b4ce3-7767-4c20-a9fb-ac79c1249822_transferwarehouse.mp4";

const steps = [
  {
    number: "01",
    title: "Chọn công ty và kho xuất",
    description:
      "Trong Tạo yêu cầu chuyển kho, chọn thẻ công ty rồi chọn kho xuất trong danh sách được lọc theo công ty đó.",
    icon: FiPackage,
  },
  {
    number: "02",
    title: "Chọn hàng và số lượng",
    description:
      "Tìm sản phẩm hoặc lô tồn kho cần chuyển, nhập số lượng cho từng dòng rồi chuyển sang bước chọn kho nhận.",
    icon: FiFileText,
  },
  {
    number: "03",
    title: "Chọn kho nhận",
    description:
      "Chọn một kho khác thuộc cùng công ty với kho xuất. Kiểm tra lại hàng, lô và số lượng trước khi tiếp tục.",
    icon: FiArrowRight,
  },
  {
    number: "04",
    title: "Chọn người duyệt và gửi",
    description:
      "Tại màn hình kiểm tra cuối, chọn Người duyệt, thêm ghi chú nếu cần và bấm Gửi yêu cầu duyệt.",
    icon: FiUsers,
  },
  {
    number: "05",
    title: "Người được chọn xử lý",
    description:
      "Người duyệt nhận thông báo trong WMS, mở chi tiết phiếu rồi chọn Duyệt yêu cầu hoặc Từ chối.",
    icon: FiBell,
  },
  {
    number: "06",
    title: "Theo dõi kết quả",
    description:
      "Sau khi duyệt, hệ thống kiểm tra tồn và tạo phiếu chuyển trên EBIZ. Mở lại chi tiết để kiểm tra trạng thái cuối cùng.",
    icon: FiCheckCircle,
  },
];

const statuses = [
  {
    name: "Chờ duyệt",
    description:
      "Phiếu đã được gửi và đang chờ người được chọn xử lý. Việc tạo yêu cầu chưa làm chuyển hàng trên hệ thống.",
  },
  {
    name: "Đang chuyển",
    description:
      "Người được chọn đã duyệt; hệ thống đang xử lý phiếu chuyển. Không gửi lại yêu cầu trong lúc này.",
  },
  {
    name: "Đã chuyển kho",
    description:
      "Phiếu chuyển đã được ghi nhận thành công. Có thể xem mã phiếu EBIZ trong trang chi tiết.",
  },
  {
    name: "Đã từ chối",
    description:
      "Người duyệt đã từ chối. Mở chi tiết để xem lý do; hàng chưa được chuyển bởi yêu cầu này.",
  },
  {
    name: "Cần đối soát",
    description:
      "Kết quả xử lý với EBIZ cần được kiểm tra lại. Liên hệ quản trị viên để đối soát trước khi tạo phiếu thay thế.",
  },
];

const questions = [
  {
    question: "Kho chưa có thủ kho phụ trách thì có chọn được không?",
    answer:
      "Có. Luồng chuyển kho mới không yêu cầu lấy thủ kho của kho xuất hoặc kho nhận làm người duyệt. Bạn chọn một người có vai trò Kho ở bước cuối.",
  },
  {
    question: "Hai kho có hai thủ kho khác nhau thì cần mấy người duyệt?",
    answer:
      "Chỉ một người: người được chọn khi tạo yêu cầu. Không cần cả hai thủ kho cùng duyệt.",
  },
  {
    question: "Vì sao không thấy kho nhận?",
    answer:
      "Kho nhận được lọc theo công ty của kho xuất và phải khác kho xuất. Hãy kiểm tra công ty, từ khóa tìm kiếm và trạng thái hoạt động của kho.",
  },
  {
    question: "Vì sao không thấy nút Duyệt yêu cầu?",
    answer:
      "Nút chỉ hiển thị khi phiếu đang Chờ duyệt và tài khoản hiện tại là người được chọn, có vai trò Kho. Admin không duyệt thay người được chọn.",
  },
  {
    question: "Vì sao số lượng đủ lúc tạo nhưng đến lúc duyệt lại báo thiếu?",
    answer:
      "Tồn khả dụng có thể đã thay đổi bởi các thao tác khác. Hệ thống kiểm tra lại số lượng và thông tin lô lúc duyệt; hãy đối chiếu tồn trước khi xử lý tiếp.",
  },
  {
    question: "Tôi được chọn duyệt nhưng không nghe âm thanh?",
    answer:
      "Hãy mở và tương tác với trang WMS, kiểm tra âm lượng và quyền phát âm thanh của trình duyệt. Thông báo được gửi tới tài khoản được chọn đang kết nối; bạn cũng có thể kiểm tra mục Yêu cầu của bạn để tìm phiếu được giao.",
  },
];

export default function WarehouseTransferGuideUpdateDetailPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModalVideo, setActiveModalVideo] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Hướng dẫn chuyển kho và chọn người duyệt | Picare Client";
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.title = "Picare Client";
    };
  }, []);

  return (
    <div className="font-haffer min-h-screen overflow-x-hidden bg-[#120F17] text-white selection:bg-[#F86D2B] selection:text-white">
      <PublicLandingNavbar isDarkBg={isScrolled} showNoticeBanner={false} />

      <main className="mx-auto max-w-3xl px-4 pt-28 pb-32 sm:px-6 sm:pt-32 lg:pt-36">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
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
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 border-b border-white/10 pb-8 sm:mt-10 sm:pb-10"
        >
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/45">
            <span className="text-[#FFA336]">Tính năng mới</span>
            <span className="text-white/20">/</span>
            <time dateTime="2026-11-10">10 Tháng 11, 2026</time>
            <span className="text-white/20">/</span>
            <span>6 phút đọc</span>
          </div>
          <h1 className="mt-5 text-2xl leading-snug font-semibold text-white sm:text-3xl md:text-[38px]">
            Hướng dẫn chuyển kho: chọn kho, gửi yêu cầu và duyệt
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Tạo phiếu chuyển kho trong Picare WMS, chọn một người duyệt và theo
            dõi kết quả. Hướng dẫn dành cho người tạo yêu cầu, nhân sự Kho và
            quản trị viên.
          </p>
        </motion.header>

        <article className="mt-8 space-y-12 text-sm leading-7 font-light text-zinc-300 sm:mt-12 sm:text-base">
          <div className="border-l-2 border-[#F86D2B] pl-4 text-sm leading-7 text-zinc-300 sm:pl-5 sm:text-[15px]">
            <strong className="font-semibold text-white">Xem nhanh:</strong>{" "}
            Chọn công ty → Kho xuất → Hàng và số lượng → Kho nhận → Người duyệt
            → Gửi yêu cầu → Duyệt và theo dõi kết quả.
          </div>

          <section id="video-huong-dan" className="scroll-mt-28 space-y-5">
            <SectionHeading number="1" title="Video hướng dẫn thao tác" />
            <p>
              Xem video để làm quen với màn hình tạo yêu cầu, chọn người duyệt
              và xử lý phiếu chuyển kho.
            </p>
            <VideoPreviewCard
              videoSrc={TRANSFER_VIDEO_URL}
              caption="Hướng dẫn chuyển kho trên Picare WMS — nhấn vào video để xem toàn màn hình."
              onOpenModal={() => setActiveModalVideo(TRANSFER_VIDEO_URL)}
            />
            <a
              href={TRANSFER_VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#FFA336] underline underline-offset-4"
            >
              Mở video trong tab mới
            </a>
          </section>

          <nav
            aria-label="Nội dung bài viết"
            className="border border-white/10 bg-white/[0.025] p-5"
          >
            <p className="mb-3 text-xs font-semibold text-[#FFA336]">
              TRONG BÀI NÀY
            </p>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <a className="hover:text-[#FFA336]" href="#cac-buoc">
                Các bước tạo và duyệt phiếu
              </a>
              <a className="hover:text-[#FFA336]" href="#nguoi-duyet">
                Chọn người duyệt và nhận thông báo
              </a>
              <a className="hover:text-[#FFA336]" href="#vai-tro">
                Ai được xem và thao tác?
              </a>
              <a className="hover:text-[#FFA336]" href="#trang-thai">
                Trạng thái phiếu chuyển kho
              </a>
              <a className="hover:text-[#FFA336]" href="#cau-hoi">
                Câu hỏi thường gặp
              </a>
            </div>
          </nav>

          <section id="cac-buoc" className="scroll-mt-28 space-y-5">
            <SectionHeading number="2" title="Các bước tạo và duyệt phiếu" />
            <p>
              Trong Picare WMS, mở{" "}
              <strong className="font-semibold text-white">
                Chuyển kho → Tạo yêu cầu
              </strong>
              . Chuẩn bị công ty sở hữu hàng, kho xuất, kho nhận, các lô cần
              chuyển và người sẽ kiểm tra phiếu.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="border border-white/10 bg-white/[0.025] p-5"
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
            <p>
              Chọn đúng từng dòng hàng và lô cần chuyển. Số lượng phải lớn hơn 0
              và không vượt tồn khả dụng. Kho xuất và kho nhận phải thuộc{" "}
              <strong className="font-semibold text-white">
                cùng một công ty
              </strong>
              ; nếu chọn nhầm công ty, quay lại bước chọn công ty và chọn lại
              kho.
            </p>
            <p>
              Sau khi gửi, mở{" "}
              <strong className="font-semibold text-white">
                Yêu cầu của bạn
              </strong>{" "}
              và bấm vào phiếu để xem chi tiết. Ghi nhớ mã phiếu để tiện trao
              đổi với người duyệt.
            </p>
          </section>

          <section id="nguoi-duyet" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="3"
              title="Chọn một người duyệt cho mỗi phiếu"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard title="Người tạo chủ động chọn" icon={FiUsers}>
                Danh sách Người duyệt chỉ hiển thị tài khoản có vai trò Kho
                (warehouse). Tìm theo tên hoặc email, chọn người phù hợp rồi gửi
                yêu cầu.
              </InfoCard>
              <InfoCard title="Thông báo tới đúng người" icon={FiBell}>
                Khi tạo phiếu thành công, WMS gửi thông báo và âm thanh tới tài
                khoản được chọn đang kết nối. Có thể bấm thông báo để mở chi
                tiết phiếu.
              </InfoCard>
            </div>
            <p>
              Người duyệt mở phiếu từ thông báo hoặc mục{" "}
              <strong className="font-semibold text-white">
                Yêu cầu của bạn
              </strong>
              , kiểm tra hai kho, danh sách sản phẩm, lô, số lượng và ghi chú.
              Các nút thao tác nằm trên{" "}
              <strong className="font-semibold text-white">
                thanh Dock ở cuối màn hình
              </strong>
              .
            </p>
            <p>
              Chọn{" "}
              <strong className="font-semibold text-white">
                Duyệt yêu cầu
              </strong>{" "}
              và xác nhận để hệ thống thực hiện chuyển kho. Nếu thông tin không
              phù hợp, chọn{" "}
              <strong className="font-semibold text-white">Từ chối</strong> và
              nhập lý do để người tạo biết cần kiểm tra gì.
            </p>
          </section>

          <section id="vai-tro" className="scroll-mt-28 space-y-5">
            <SectionHeading number="4" title="Ai được xem và thao tác?" />
            <div className="space-y-4">
              <RoleRow
                role="Người tạo yêu cầu"
                detail="Admin, nhân sự phụ trách brand (admin_brand) và nhân sự Kho (warehouse) được tạo phiếu và chọn người duyệt. Người tạo theo dõi các phiếu của mình trong Yêu cầu của bạn."
              />
              <RoleRow
                role="Người được chọn"
                detail="Tài khoản có vai trò Kho được chỉ định trên phiếu được xem, duyệt hoặc từ chối khi phiếu còn Chờ duyệt."
              />
              <RoleRow
                role="Admin, CEO, Tài chính"
                detail="Được xem danh sách và chi tiết các phiếu để theo dõi. Quyền theo dõi không thay thế việc duyệt của người đã được chỉ định."
              />
              <RoleRow
                role="Admin"
                detail="Trong chi tiết phiếu, nút Xóa đợt nằm ở Dock dưới cùng. Không thể xóa khi phiếu đang xử lý. Việc xóa hồ sơ không hoàn tác hàng đã chuyển hoặc phiếu EBIZ đã được ghi nhận."
              />
            </div>
          </section>

          <section id="trang-thai" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="5"
              title="Đọc trạng thái để biết bước tiếp theo"
            />
            <div className="divide-y divide-white/10 border border-white/10">
              {statuses.map((status) => (
                <div
                  key={status.name}
                  className="grid gap-2 p-4 sm:grid-cols-[150px_1fr] sm:gap-5"
                >
                  <h3 className="text-sm font-semibold text-white">
                    {status.name}
                  </h3>
                  <p className="text-sm leading-6 text-zinc-400">
                    {status.description}
                  </p>
                </div>
              ))}
            </div>
            <p>
              Luôn mở lại chi tiết để kiểm tra kết quả trước khi gửi một yêu cầu
              khác cho cùng lượng hàng. Với trạng thái{" "}
              <strong className="font-semibold text-white">Cần đối soát</strong>
              , cung cấp mã phiếu cho quản trị viên để kiểm tra kết quả thực tế
              trên EBIZ.
            </p>
          </section>

          <section id="cau-hoi" className="scroll-mt-28 space-y-5">
            <SectionHeading number="6" title="Câu hỏi thường gặp" />
            <div className="space-y-3">
              {questions.map((item) => (
                <div
                  key={item.question}
                  className="border border-white/10 bg-white/[0.025] p-5"
                >
                  <h3 className="text-sm font-semibold text-white">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {item.answer}
                  </p>
                </div>
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

      {/* Component Transition Video Cinematic đè lên toàn màn hình */}
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
      <button
        type="button"
        aria-label="Xem video hướng dẫn chuyển kho toàn màn hình"
        onClick={onOpenModal}
        onMouseEnter={handleCardMouseEnter}
        onMouseLeave={handleCardMouseLeave}
        className="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#0e0b13] shadow-[0_24px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(248,109,43,0.12)] transition-all duration-500 hover:border-white/25 hover:shadow-[0_28px_90px_rgba(0,0,0,0.95),0_0_70px_rgba(248,109,43,0.28)] sm:rounded-2xl"
      >
        {/* Top ambient highlight line */}
        <div className="pointer-events-none absolute inset-x-8 top-0 z-30 h-px bg-gradient-to-r from-transparent via-[#F86D2B]/60 to-transparent" />

        {/* Video preview tự nhiên ban đầu */}
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

        {/* Lớp layout đen mờ: BAN ĐẦU ẨN (opacity: 0), HOVER MỚI THẤY và click để xem toàn màn hình */}
        <div
          ref={cardOverlayRef}
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 px-6 opacity-0 backdrop-blur-[3px]"
        >
          {/* Logo Picare Client */}
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

          {/* Text helper */}
          <p
            ref={cardHelperRef}
            className="font-haffer mt-1 text-[11px] font-normal text-zinc-300 opacity-0 sm:text-xs"
          >
            Nhấn để xem video toàn màn hình
          </p>
        </div>
      </button>

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
    <div className="grid gap-1 border-b border-white/10 pb-3 sm:grid-cols-[170px_1fr] sm:gap-4">
      <strong className="text-sm font-semibold text-white">{role}</strong>
      <p className="text-sm leading-6 text-zinc-400">{detail}</p>
    </div>
  );
}
