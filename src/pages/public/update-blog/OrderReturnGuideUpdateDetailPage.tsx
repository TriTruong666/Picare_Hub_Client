import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiMail,
  FiPackage,
  FiPenTool,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import CinematicVideoModal from "@/components/custom_ui/CinematicVideoModal";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import { PATHS } from "@/config/paths";

const CUSTOMER_VIDEO_URL =
  "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1790064168652_9f235726-a528-4e55-9052-47489360b497_trahangcustomer.mp4";

const SALES_VIDEO_URL =
  "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1790064163432_8b4dc8a8-829f-43ee-b701-dd835609c9c2_trahangsales.mp4";

const RETURN_STEPS = [
  {
    number: "01",
    title: "Nhân viên tạo yêu cầu",
    description:
      "Nhân viên bán hàng chọn đơn gốc, sản phẩm, số lượng cần trả và email của người sẽ ký biên bản.",
    icon: FiFileText,
  },
  {
    number: "02",
    title: "Khách hàng xác nhận",
    description:
      "Khách hàng mở liên kết bảo mật trong email, kiểm tra nội dung, nhập lý do và ký tay trực tuyến.",
    icon: FiPenTool,
  },
  {
    number: "03",
    title: "Picare kiểm tra hồ sơ",
    description:
      "Biên bản PDF đã ký được lưu lại để bộ phận phụ trách đối chiếu đơn gốc, hàng trả và giá trị dự kiến.",
    icon: FiCheckCircle,
  },
  {
    number: "04",
    title: "Kho tiếp nhận thực tế",
    description:
      "Kho kiểm đếm sản phẩm, số lượng và lô hàng trước khi xác nhận kết quả nhận hàng trên hệ thống.",
    icon: FiPackage,
  },
];

const RETURN_STATUSES = [
  {
    name: "Chờ khách hàng ký",
    meaning:
      "Email ký đã được gửi. Khách hàng cần nhập lý do và hoàn tất chữ ký điện tử.",
  },
  {
    name: "Chờ Admin kiểm tra",
    meaning:
      "Khách hàng đã ký và PDF đã được lưu. Admin đối chiếu hồ sơ trước khi duyệt.",
  },
  {
    name: "Chờ Kế toán kiểm tra",
    meaning:
      "Áp dụng khi hồ sơ cần đối chiếu thêm về hóa đơn hoặc giá trị tài chính.",
  },
  {
    name: "Đã duyệt – chờ Kho",
    meaning:
      "Hồ sơ đã qua bước kiểm tra và đang chờ Kho kiểm nhận hàng thực tế.",
  },
  {
    name: "Kho đã nhận hàng",
    meaning:
      "Kho đã xác nhận số lượng thực nhận; hệ thống tiếp tục cập nhật giá trị đơn và dữ liệu liên quan.",
  },
  {
    name: "Từ chối hoặc đã hủy",
    meaning:
      "Quy trình đã dừng. Nhân viên có thể xem lịch sử để biết người xử lý và lý do.",
  },
];

export default function OrderReturnGuideUpdateDetailPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeModalVideo, setActiveModalVideo] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      "Hướng dẫn quy trình trả hàng và ký biên bản điện tử | Picare Client";

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
      document.title = "Picare Hub";
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
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
            className="group inline-flex items-center gap-2 text-xs font-normal text-white/50 transition hover:text-white"
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
          <div className="flex flex-wrap items-center gap-3 text-xs font-normal text-white/45">
            <span className="text-[#FFA336]">Tính năng mới</span>
            <span className="text-white/20">/</span>
            <time dateTime="2026-09-22">22 Tháng 09, 2026</time>
            <span className="text-white/20">/</span>
            <span>Bản phát hành v1.0.0-return</span>
          </div>

          <h1 className="mt-5 text-2xl leading-snug font-semibold text-white sm:text-3xl md:text-[38px]">
            Hướng dẫn quy trình trả hàng và ký biên bản điện tử
          </h1>
        </motion.header>

        <article className="mt-8 space-y-10 text-sm leading-relaxed font-light text-zinc-300 sm:mt-12 sm:text-base">
          <div className="border-l-2 border-[#F86D2B] pl-4 text-sm leading-relaxed text-zinc-300 italic sm:pl-5 sm:text-[15px]">
            Tóm lược: Quy trình trả hàng mới kết nối nhân viên bán hàng, khách
            hàng, bộ phận kiểm duyệt và Kho trong cùng một hồ sơ. Khách hàng có
            thể kiểm tra biên bản, nhập lý do và ký trực tuyến; nhân viên theo
            dõi trạng thái xử lý, tải PDF đã ký và đối chiếu kết quả nhận hàng
            ngay trên Picare Salesforce.
          </div>

          <section className="space-y-4">
            <h2 className="font-haffer pt-2 text-lg font-semibold text-white sm:text-xl">
              1. Quy trình trả hàng mới có gì khác?
            </h2>
            <p>
              Trước đây, thông tin trả hàng có thể được trao đổi qua nhiều kênh
              và khó xác định hồ sơ đang chờ ai xử lý. Tính năng mới tạo một yêu
              cầu riêng gắn với đơn hàng gốc, lưu rõ sản phẩm, số lượng, giá trị
              dự kiến, người tạo và toàn bộ lịch sử thay đổi trạng thái.
            </p>
            <p>
              Biên bản không còn phải gửi qua lại để ký thủ công. Hệ thống gửi
              một liên kết bảo mật đến email người ký; sau khi khách hàng nhập
              lý do và ký tay, Picare tự tạo PDF có thông tin hai bên, danh sách
              hàng trả, chữ ký khách hàng và xác nhận của doanh nghiệp phụ trách
              đơn hàng.
            </p>
          </section>

          <section className="space-y-5">
            <h2 className="font-haffer pt-2 text-lg font-semibold text-white sm:text-xl">
              2. Bốn bước của một yêu cầu trả hàng
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {RETURN_STEPS.map((step) => {
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
                    <h3 className="mt-3 font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-haffer pt-2 text-lg font-semibold text-white sm:text-xl">
              3. Hướng dẫn dành cho khách hàng
            </h2>
            <div className="space-y-5 border-l border-white/10 pl-5">
              <GuideStep number="01" title="Mở email ký biên bản">
                Email được gửi đến địa chỉ mà nhân viên Picare đã xác nhận với
                bạn. Nhấn vào liên kết trong email để mở trang biên bản; bạn
                không cần đăng nhập tài khoản Picare.
              </GuideStep>
              <GuideStep number="02" title="Kiểm tra thông tin">
                Đối chiếu tên đơn vị nhận hàng, thông tin khách hàng, mã đơn,
                sản phẩm, lô hoặc hạn sử dụng, số lượng và giá trị dự kiến. Nếu
                có thông tin chưa đúng, hãy dừng ký và liên hệ nhân viên phụ
                trách để điều chỉnh yêu cầu.
              </GuideStep>
              <GuideStep number="03" title="Nhập lý do và ký tay">
                Nhấn nút ký ở thanh công cụ phía dưới màn hình. Trong cửa sổ
                hiện ra, nhập lý do trả hàng, sau đó dùng chuột hoặc ngón tay ký
                trong khung chữ ký. Có thể chọn “Ký lại” nếu nét ký chưa đúng.
              </GuideStep>
              <GuideStep number="04" title="Xác nhận và lưu biên bản">
                Chọn “Xác nhận ký” và chờ hệ thống tạo PDF. Khi hoàn tất, trạng
                thái sẽ chuyển sang đã ký và nút tải PDF xuất hiện ở thanh công
                cụ. Bạn nên lưu một bản để đối chiếu khi bàn giao hàng.
              </GuideStep>
            </div>

            <ImportantNote icon={FiClock} title="Thời hạn của liên kết ký">
              Liên kết mặc định có hiệu lực trong 72 giờ. Nếu liên kết hết hạn,
              không mở được hoặc email chưa đến, hãy liên hệ nhân viên bán hàng
              để kiểm tra địa chỉ email và gửi lại liên kết mới.
            </ImportantNote>
          </section>

          {/* Video 1: Hướng dẫn dành cho khách hàng */}
          <VideoPreviewCard
            videoSrc={CUSTOMER_VIDEO_URL}
            caption="Video 1: Minh họa các bước kiểm tra thông tin và ký biên bản trả hàng điện tử dành cho khách hàng."
            onOpenModal={() => setActiveModalVideo(CUSTOMER_VIDEO_URL)}
          />

          <section className="space-y-4">
            <h2 className="font-haffer pt-2 text-lg font-semibold text-white sm:text-xl">
              4. Hướng dẫn dành cho nhân viên bán hàng
            </h2>
            <p>
              Tại phân hệ Trả hàng trên Picare Salesforce, chọn “Tạo yêu cầu” và
              tìm đơn hàng gốc. Hệ thống chỉ hiển thị các đơn đã giao, đã hoàn
              tất hoặc đã hoàn tất một đợt trả trước đó và vẫn còn số lượng có
              thể trả.
            </p>
            <ol className="space-y-3 pl-5 marker:font-semibold marker:text-[#FFA336]">
              <li className="pl-2">
                Chọn đúng đơn hàng và kiểm tra thông tin khách hàng, giao nhận,
                hóa đơn của đơn gốc.
              </li>
              <li className="pl-2">
                Chọn từng sản phẩm và nhập số lượng trả. Số lượng không được lớn
                hơn phần còn có thể trả trên hệ thống.
              </li>
              <li className="pl-2">
                Nhập đúng họ tên người ký và email nhận liên kết. Kiểm tra kỹ
                chính tả vì đây là địa chỉ hệ thống dùng để xác minh hồ sơ.
              </li>
              <li className="pl-2">
                Xem lại giá trị dự kiến, sản phẩm, số lượng rồi gửi yêu cầu. Đơn
                gốc sẽ chuyển sang trạng thái đang xử lý trả hàng.
              </li>
              <li className="pl-2">
                Mở chi tiết yêu cầu để theo dõi email, chữ ký, PDF và lịch sử.
                Nếu gửi email thất bại hoặc khách chưa nhận được, dùng thao tác
                “Gửi lại email ký”.
              </li>
            </ol>

            <ImportantNote icon={FiAlertCircle} title="Kiểm tra trước khi gửi">
              Mỗi đơn chỉ có một yêu cầu trả hàng đang hoạt động tại một thời
              điểm. Nếu chọn sai sản phẩm, số lượng hoặc email người ký, không
              yêu cầu khách tiếp tục ký; hãy hủy hồ sơ sai với lý do rõ ràng và
              tạo lại theo đúng thông tin.
            </ImportantNote>
          </section>

          {/* Video 2: Hướng dẫn dành cho nhân viên bán hàng */}
          <VideoPreviewCard
            videoSrc={SALES_VIDEO_URL}
            caption="Video 2: Minh họa quy trình tạo yêu cầu trả hàng và gửi email ký biên bản dành cho nhân viên bán hàng."
            onOpenModal={() => setActiveModalVideo(SALES_VIDEO_URL)}
          />

          <section className="space-y-5">
            <h2 className="font-haffer pt-2 text-lg font-semibold text-white sm:text-xl">
              5. Cách đọc trạng thái yêu cầu
            </h2>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {RETURN_STATUSES.map((status) => (
                <div
                  key={status.name}
                  className="grid gap-2 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-6"
                >
                  <strong className="font-semibold text-white">
                    {status.name}
                  </strong>
                  <p className="text-sm leading-6 text-zinc-400">
                    {status.meaning}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-haffer pt-2 text-lg font-semibold text-white sm:text-xl">
              6. Biên bản điện tử ghi nhận những gì?
            </h2>
            <p>
              PDF được tạo sau khi khách hàng ký chứa mã yêu cầu, mã đơn hàng,
              thông tin pháp nhân Bên A, thông tin Bên B, danh sách sản phẩm, số
              lượng, đơn giá, giá trị dự kiến, lý do trả hàng và chữ ký. Hồ sơ
              ký cùng ảnh chữ ký được lưu để bộ phận nội bộ tải xuống và đối
              chiếu.
            </p>
            <p>
              Với đơn có yêu cầu xuất hóa đơn, bộ phận phụ trách có thể bổ sung
              thông tin hoặc tệp hóa đơn liên quan trên hồ sơ trả hàng. Biên bản
              trả hàng không tự thay thế hóa đơn, chứng từ thuế hoặc quy trình
              thanh toán theo chính sách của công ty.
            </p>
          </section>

          <section className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="font-haffer text-lg font-semibold text-white sm:text-xl">
              7. Những lưu ý quan trọng
            </h2>
            <ul className="space-y-3 pl-5 marker:text-[#FFA336]">
              <li className="pl-2">
                Việc ký biên bản chỉ xác nhận nội dung yêu cầu, không đồng nghĩa
                Kho đã nhận hàng hoặc khoản tiền đã được hoàn.
              </li>
              <li className="pl-2">
                Kho sẽ kiểm đếm số lượng thực nhận. Nếu nhận thiếu so với yêu
                cầu, nhân viên Kho phải ghi chú đối soát trên hệ thống.
              </li>
              <li className="pl-2">
                Không chuyển tiếp liên kết ký cho người không có thẩm quyền và
                không đăng ảnh chữ ký hoặc PDF lên kênh công khai.
              </li>
              <li className="pl-2">
                Khách hàng nên bàn giao đúng sản phẩm, lô hàng và số lượng đã
                ghi trên biên bản để rút ngắn thời gian kiểm nhận.
              </li>
            </ul>

            <div className="mt-6 flex items-start gap-3 border border-[#F86D2B]/25 bg-[#F86D2B]/8 p-4 text-sm leading-6 text-zinc-300">
              <FiMail
                aria-hidden="true"
                className="mt-1 h-4 w-4 shrink-0 text-[#FFA336]"
              />
              <p>
                Khi cần hỗ trợ, khách hàng nên cung cấp mã đơn hàng hoặc mã yêu
                cầu trả hàng cho nhân viên phụ trách. Nhân viên Picare có thể
                kiểm tra lịch sử trạng thái để xác định hồ sơ đang chờ khách
                hàng, Admin, Kế toán hay Kho xử lý.
              </p>
            </div>
          </section>
        </article>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-xs font-normal text-white/50 sm:flex-row sm:items-center">
          <Link
            to={PATHS.CHANGES}
            className="group inline-flex items-center gap-2 transition hover:text-white"
          >
            <FiArrowLeft
              aria-hidden="true"
              className="transition group-hover:-translate-x-1"
            />
            Quay lại danh sách cập nhật
          </Link>
          <span>IT Picare Vietnam</span>
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
      <div
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
      </div>

      <figcaption className="text-center text-xs font-light text-zinc-400">
        {caption}
      </figcaption>
    </figure>
  );
}

function GuideStep({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute -left-[29px] flex h-4 w-4 items-center justify-center rounded-full bg-[#120F17] text-[9px] font-semibold text-[#FFA336]">
        {number}
      </span>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-zinc-400">{children}</p>
    </div>
  );
}

function ImportantNote({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof FiClock;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center gap-2 text-[#FFA336]">
        <Icon aria-hidden="true" className="h-4 w-4" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{children}</p>
    </div>
  );
}
