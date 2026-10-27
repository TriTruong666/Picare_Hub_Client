import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCreditCard,
  FiFileText,
  FiHelpCircle,
  FiInfo,
  FiLock,
  FiMail,
  FiPenTool,
  FiRotateCw,
  FiShield,
  FiUser,
  FiUserCheck,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import CinematicVideoModal from "@/components/custom_ui/CinematicVideoModal";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import { PATHS } from "@/config/paths";

const OFFICE_SETUP_VIDEO_URL =
  "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1792382969520_18adb50c-435a-4600-8314-7a21df9b3c22_officesetup.mp4";

const SETUP_STEPS = [
  {
    number: "01",
    title: "Thông tin cá nhân & Ngân hàng",
    description:
      "Kiểm tra và điền thông tin liên hệ, ngày sinh, giới tính và tài khoản ngân hàng thụ hưởng nhận lương/thanh toán.",
    icon: FiUser,
  },
  {
    number: "02",
    title: "Căn cước công dân & Quét OCR",
    description:
      "Tải ảnh 2 mặt CCCD, xoay ảnh đúng chiều. Hệ thống tự động nhận diện và trích xuất thông tin qua công nghệ OCR.",
    icon: FiCreditCard,
  },
  {
    number: "03",
    title: "Chữ ký cá nhân điện tử",
    description:
      "Vẽ trực tiếp chữ ký trên bàn vẽ cảm ứng/chuột hoặc tải ảnh chữ ký có sẵn để dùng cho việc ký duyệt chứng từ nội bộ.",
    icon: FiPenTool,
  },
  {
    number: "04",
    title: "Ảnh đại diện chân dung",
    description:
      "Tải ảnh chân dung rõ nét để làm avatar đại diện hiển thị trên thẻ nhân viên, thanh điều hướng và danh bạ công ty.",
    icon: FiUserCheck,
  },
  {
    number: "05",
    title: "Hoàn tất & Kích hoạt tài khoản",
    description:
      "Đối soát lại toàn bộ hồ sơ, xác nhận hoàn tất để hệ thống đồng bộ dữ liệu, mở khóa quyền truy cập Picare Office.",
    icon: FiCheckCircle,
  },
];

const ACCOUNT_STATUSES = [
  {
    name: "Chưa kích hoạt (PENDING)",
    description:
      "Tài khoản đã được gửi thư mời; cần mở liên kết trong email để hoàn tất 5 bước thiết lập hồ sơ.",
  },
  {
    name: "Đang đồng bộ hồ sơ",
    description:
      "Hệ thống đang kiểm tra, xác thực OCR, lưu trữ chữ ký số và thiết lập không gian làm việc an toàn.",
  },
  {
    name: "Đã kích hoạt (ACTIVE)",
    description:
      "Hồ sơ hoàn tất 100%; tài khoản có toàn quyền truy cập phân hệ Picare Office theo phân quyền được giao.",
  },
  {
    name: "Hết hạn hoặc vô hiệu (INACTIVE)",
    description:
      "Lời mời quá 3 ngày hoặc chưa được cấp quyền; liên hệ bộ phận IT/Nhân sự để cấp lại liên kết mời mới.",
  },
];

const FAQS = [
  {
    question: "Tôi không nhận được email thư mời tham gia Picare Office?",
    answer:
      "Hãy kiểm tra kỹ hộp thư Rác (Spam/Junk) hoặc thẻ Quảng cáo/Cập nhật trong Gmail. Nếu vẫn chưa thấy, hãy liên hệ ngay Quản trị viên IT hoặc Nhân sự công ty để kiểm tra email đăng ký và gửi lại lời mời.",
  },
  {
    question: "Liên kết mời có thời hạn bao lâu?",
    answer:
      "Vì lý do an toàn bảo mật dữ liệu, mỗi mã liên kết (token) chỉ có hiệu lực trong vòng 3 ngày kể từ khi phát hành. Nếu quá hạn, bạn sẽ nhận được thông báo hết hạn và cần yêu cầu cấp liên kết mới.",
  },
  {
    question:
      "Ảnh CCCD tải lên bị ngược hoặc công nghệ OCR đọc sai thông tin thì sao?",
    answer:
      "Hệ thống cung cấp sẵn nút Xoay ảnh (Rotate 90°) trực tiếp trên giao diện để đưa thẻ về đúng chiều đọc. Sau khi OCR quét, bạn có thể chỉnh sửa thủ công từng ô thông tin (số CCCD, ngày cấp, nơi cấp...) để đảm bảo khớp hoàn toàn với thực tế.",
  },
  {
    question: "Chữ ký cá nhân sau khi kích hoạt có thay đổi được không?",
    answer:
      "Có. Sau khi vào được giao diện chính của Picare Office, bạn hoàn toàn có thể vào mục Cài đặt tài khoản / Hồ sơ cá nhân để vẽ lại hoặc tải lên chữ ký mới bất cứ lúc nào.",
  },
  {
    question: 'Tại sao màn hình báo lỗi "Không thể sử dụng lời mời"?',
    answer:
      "Lỗi này xuất hiện khi bạn đang đăng nhập vào trình duyệt bằng một tài khoản email khác với email được mời. Hãy đăng xuất hoặc mở liên kết trong cửa sổ ẩn danh và đăng nhập đúng email nhận thư mời.",
  },
];

export default function OfficeSetupGuideUpdateDetailPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModalVideo, setActiveModalVideo] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      "Hướng dẫn thiết lập tài khoản và kích hoạt Picare Office | Picare Client";

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
            <time dateTime="2026-10-19">19 Tháng 10, 2026</time>
            <span className="text-white/20">/</span>
            <span>5 phút đọc</span>
          </div>
          <h1 className="mt-5 text-2xl leading-snug font-semibold text-white sm:text-3xl md:text-[38px]">
            Hướng dẫn thiết lập tài khoản và kích hoạt Picare Office
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Dành cho toàn thể nhân sự nhận được thư mời tham gia Picare Office.
            Hướng dẫn đầy đủ từng bước từ tiếp nhận lời mời, hoàn tất thông tin
            cá nhân, xác thực CCCD qua công nghệ nhận diện tự động (OCR), tạo
            chữ ký điện tử đến kích hoạt không gian làm việc.
          </p>
        </motion.header>

        {/* Nội dung bài viết */}
        <article className="mt-8 space-y-12 text-sm leading-7 font-light text-zinc-300 sm:mt-12 sm:text-base">
          {/* Tóm tắt nhanh */}
          <div className="border-l-2 border-[#F86D2B] pl-4 text-sm leading-7 text-zinc-300 sm:pl-5 sm:text-[15px]">
            <strong className="font-semibold text-white">Xem nhanh:</strong> Mở
            email lời mời → Điền thông tin cá nhân & Ngân hàng → Quét 2 mặt CCCD
            qua OCR → Ký tay điện tử → Tải ảnh đại diện → Kích hoạt tài khoản
            vào Picare Office.
          </div>

          {/* Mục lục bài viết */}
          <nav
            aria-label="Nội dung bài viết"
            className="border border-white/10 bg-white/[0.025] p-5"
          >
            <p className="mb-3 text-xs font-semibold text-[#FFA336]">
              TRONG BÀI NÀY
            </p>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <a className="hover:text-[#FFA336]" href="#tiep-nhan-loi-moi">
                1. Tiếp nhận lời mời & Xác thực
              </a>
              <a className="hover:text-[#FFA336]" href="#quy-trinh-5-buoc">
                2. Quy trình 5 bước thiết lập
              </a>
              <a className="hover:text-[#FFA336]" href="#video-huong-dan">
                3. Video hướng dẫn thao tác thực tế
              </a>
              <a className="hover:text-[#FFA336]" href="#cccd-va-chu-ky">
                4. Lưu ý khi quét CCCD & Chữ ký số
              </a>
              <a className="hover:text-[#FFA336]" href="#trang-thai-va-faq">
                5. Trạng thái & Câu hỏi thường gặp
              </a>
            </div>
          </nav>

          {/* Mục 1: Tiếp nhận lời mời */}
          <section id="tiep-nhan-loi-moi" className="scroll-mt-28 space-y-5">
            <SectionHeading number="1" title="Tiếp nhận lời mời & Xác thực" />
            <p>
              Khi bạn được phân quyền gia nhập nền tảng văn phòng số{" "}
              <strong className="font-semibold text-white">
                Picare Office
              </strong>
              , hệ thống sẽ tự động gửi một email thông báo kèm đường liên kết
              mời riêng biệt chứa mã định danh bảo mật cá nhân (invitation
              token).
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard title="Đúng tài khoản email" icon={FiMail}>
                Hãy chắc chắn rằng bạn đang đăng nhập vào trình duyệt bằng đúng
                địa chỉ email công ty hoặc email cá nhân đã đăng ký nhận lời
                mời.
              </InfoCard>
              <InfoCard title="Thời hạn bảo mật 3 ngày" icon={FiLock}>
                Mỗi mã lời mời có hiệu lực bảo mật nghiêm ngặt trong vòng 3
                ngày. Hãy hoàn tất thiết lập sớm nhất để tránh token bị hủy kích
                hoạt.
              </InfoCard>
            </div>
            <p>
              Khi nhấp vào liên kết từ thư mời, bạn sẽ được dẫn trực tiếp đến
              màn hình khởi tạo hồ sơ nhân sự bảo mật.
            </p>
          </section>

          {/* Mục 2: 5 bước thiết lập */}
          <section id="quy-trinh-5-buoc" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="2"
              title="Quy trình 5 bước thiết lập tài khoản"
            />
            <p>
              Quy trình thiết lập được tối ưu thành 5 bước tuần tự, trực quan và
              bảo mật cao:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {SETUP_STEPS.map((step) => {
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

            <div className="space-y-4 pt-2">
              <h3 className="font-semibold text-white">
                Bước 1: Thông tin cơ bản & Tài khoản nhận lương
              </h3>
              <p>
                Kiểm tra thông tin họ tên, email cá nhân, số điện thoại, ngày
                sinh và giới tính. Cung cấp thông tin tài khoản ngân hàng thụ
                hưởng (chọn ngân hàng từ danh sách liên kết VietQR, nhập số tài
                khoản và tên chủ tài khoản). Dữ liệu này dùng để phục vụ chi trả
                lương thưởng và phụ cấp nội bộ.
              </p>

              <h3 className="font-semibold text-white">
                Bước 2: Xác minh Căn cước công dân qua OCR
              </h3>
              <p>
                Tải lên ảnh 2 mặt của thẻ Căn cước công dân (CCCD). Hệ thống
                tích hợp sẵn công nghệ nhận diện ký tự quang học (OCR) để tự
                động đọc số CCCD, ngày cấp, nơi cấp, ngày hết hạn và địa chỉ
                thường trú. Nếu ảnh chụp bị lệch góc, sử dụng nút xoay ảnh để
                đưa về hướng chuẩn xác.
              </p>

              <h3 className="font-semibold text-white">
                Bước 3: Tạo chữ ký cá nhân điện tử
              </h3>
              <p>
                Bạn có thể vẽ trực tiếp chữ ký của mình ngay trên màn hình bằng
                chuột hoặc màn hình cảm ứng điện thoại/máy tính bảng, hoặc tải
                lên tệp ảnh chữ ký có sẵn. Chữ ký này sẽ được sử dụng để ký điện
                tử trên các biên bản kiểm kê, phiếu bàn giao, đề xuất nội bộ.
              </p>

              <h3 className="font-semibold text-white">
                Bước 4: Tải ảnh đại diện chân dung
              </h3>
              <p>
                Chọn một bức ảnh chân dung rõ nét, kích thước tối đa 10 MB (định
                dạng PNG, JPEG hoặc WEBP). Ảnh đại diện sẽ hiển thị trên hồ sơ
                nhân sự, thẻ nhân viên và hệ thống giao tiếp toàn công ty.
              </p>

              <h3 className="font-semibold text-white">
                Bước 5: Hoàn tất & Kích hoạt quyền truy cập
              </h3>
              <p>
                Xem lại bản tóm tắt hồ sơ một lần cuối. Bấm nút{" "}
                <strong className="font-semibold text-white">
                  Hoàn tất thiết lập
                </strong>
                . Hệ thống sẽ tiến hành đồng bộ dữ liệu vào hệ thống phân quyền
                Picare Office, trình diễn hiệu ứng chào mừng và đưa bạn vào giao
                diện bàn làm việc chính.
              </p>
            </div>
          </section>

          {/* Mục 3: Video minh họa */}
          <section id="video-huong-dan" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="3"
              title="Video hướng dẫn thao tác thực tế"
            />
            <p>
              Theo dõi chi tiết toàn bộ các thao tác từng bước từ khi mở email
              đến khi kích hoạt tài khoản thành công qua video dưới đây:
            </p>

            <VideoPreviewCard
              videoSrc={OFFICE_SETUP_VIDEO_URL}
              caption="Video hướng dẫn thực tế thiết lập tài khoản Picare Office: Nhập thông tin, xoay chỉnh và quét OCR CCCD, tạo chữ ký số và hoàn tất kích hoạt."
              onOpenModal={() => setActiveModalVideo(OFFICE_SETUP_VIDEO_URL)}
            />
          </section>

          {/* Mục 4: Lưu ý CCCD & Chữ ký */}
          <section id="cccd-va-chu-ky" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="4"
              title="Lưu ý khi quét CCCD & Chữ ký số"
            />
            <div className="space-y-3">
              <RoleRow
                role="Chất lượng ảnh CCCD"
                detail="Chụp thẳng góc, đủ ánh sáng, rõ 4 góc thẻ và không bị lóa đèn flash. Không chụp ảnh qua màn hình thiết bị khác."
              />
              <RoleRow
                role="Xoay ảnh đúng chiều"
                detail="Nếu ảnh CCCD bị quay ngang hoặc lộn ngược, hãy bấm biểu tượng xoay (Rotate) để thẻ nằm đúng chiều trước khi hệ thống chạy OCR."
              />
              <RoleRow
                role="Đối soát dữ liệu OCR"
                detail="Hệ thống sẽ gợi ý cập nhật lại tên hoặc ngày sinh nếu phát hiện thông tin CCCD khác với bước 1. Bạn hoàn toàn có thể sửa tay nếu OCR nhận diện nhầm."
              />
              <RoleRow
                role="Chữ ký cá nhân"
                detail="Ký nét dứt khoát, dễ nhận diện. Tránh vẽ nét đứt quãng hoặc ký qua loa vì chữ ký này mang tính pháp lý trong các chứng từ nội bộ của công ty."
              />
            </div>
          </section>

          {/* Mục 5: Trạng thái & FAQ */}
          <section id="trang-thai-va-faq" className="scroll-mt-28 space-y-5">
            <SectionHeading
              number="5"
              title="Trạng thái tài khoản & Câu hỏi thường gặp"
            />

            <div className="divide-y divide-white/10 border border-white/10">
              {ACCOUNT_STATUSES.map((status) => (
                <div
                  key={status.name}
                  className="grid gap-1 px-5 py-4 sm:grid-cols-[210px_1fr] sm:gap-4"
                >
                  <strong className="text-sm font-semibold text-white">
                    {status.name}
                  </strong>
                  <span className="text-sm text-zinc-400">
                    {status.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4">
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
                  <p className="mt-2 pl-6.5 text-sm leading-6 text-zinc-400">
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
              Nếu gặp bất kỳ trở ngại nào trong quá trình nhập liệu, nhận diện
              CCCD hoặc kích hoạt tài khoản, xin vui lòng liên hệ ngay bộ phận
              IT Picare Vietnam để được trợ giúp kịp thời.
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
