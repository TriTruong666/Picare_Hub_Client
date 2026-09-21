import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { FiArrowLeft } from "react-icons/fi";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import CinematicVideoModal from "@/components/custom_ui/CinematicVideoModal";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import { PATHS } from "@/config/paths";

const VIDEO_URL =
  "https://picare-s3.s3.ap-southeast-1.amazonaws.com/public/1789975922466_a82ad095-24af-4934-ba6b-1a18ff38b7bc_clientloginnew.mp4";

export default function SecurityOfficeUpdateDetailPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Đăng nhập an toàn hơn trên Picare Client | Picare Client";

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
      {/* Header Navbar */}
      <PublicLandingNavbar isDarkBg={isScrolled} showNoticeBanner={false} />

      <main className="mx-auto max-w-3xl px-4 pt-28 pb-32 sm:px-6 sm:pt-32 lg:pt-36">
        {/* Nút quay lại danh sách */}
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

        {/* Header bài viết phong cách Academic Essay */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 border-b border-white/10 pb-8 sm:mt-10 sm:pb-10"
        >
          {/* Metadata phẳng: Typography đơn giản, không badge pill */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-normal text-white/45">
            <span className="text-[#FFA336]">Bảo mật</span>
            <span className="text-white/20">/</span>
            <time dateTime="2026-09-21">21 Tháng 09, 2026</time>
            <span className="text-white/20">/</span>
            <span>Bản phát hành v1.1.0-sec</span>
          </div>

          <h1 className="mt-5 text-2xl leading-snug font-semibold text-white sm:text-3xl md:text-[38px]">
            Đăng nhập an toàn hơn trên Picare Client
          </h1>
        </motion.header>

        {/* Nội dung bài viết học thuật: Tập trung văn bản chuyên sâu */}
        <article className="mt-8 space-y-10 text-sm leading-relaxed font-light text-zinc-300 sm:mt-12 sm:text-base">
          {/* Tóm tắt mở đầu (Abstract) */}
          <div className="border-l-2 border-[#F86D2B] pl-4 text-sm leading-relaxed text-zinc-300 italic sm:pl-5 sm:text-[15px]">
            Tóm lược: Picare Client bổ sung bước xác minh bằng mã OTP khi tài
            khoản đăng nhập từ một địa chỉ IP mới. Sau khi xác minh thành công,
            địa chỉ IP đó sẽ được ghi nhận là tin cậy trong một khoảng thời gian
            để những lần đăng nhập tiếp theo thuận tiện hơn. Bản cập nhật cũng
            giúp bảo vệ tài khoản tốt hơn khi người dùng đổi mật khẩu, bị khóa
            tài khoản hoặc có thay đổi về quyền truy cập.
          </div>

          {/* Phần 1 */}
          <section className="space-y-4">
            <h2 className="font-haffer pt-2 text-lg font-semibold text-white sm:text-xl">
              1. Vì sao Picare bổ sung bước xác minh khi đăng nhập?
            </h2>
            <p>
              Trước đây, người dùng chỉ cần email và mật khẩu để đăng nhập. Cách
              này nhanh, nhưng chưa đủ an toàn trong trường hợp mật khẩu vô tình
              bị lộ hoặc được sử dụng trên một mạng lạ. Vì vậy, Picare bổ sung
              thêm một bước xác minh qua email khi hệ thống nhận thấy địa chỉ IP
              đăng nhập chưa từng được tin cậy.
            </p>
            <p>
              Việc xác minh chỉ xuất hiện khi cần thiết. Nếu bạn tiếp tục đăng
              nhập từ mạng quen thuộc và địa chỉ IP vẫn còn thời hạn tin cậy,
              quá trình đăng nhập sẽ diễn ra như bình thường mà không cần nhập
              lại OTP. Mục tiêu của thay đổi này là tăng độ an toàn nhưng vẫn
              giữ thao tác hằng ngày đơn giản.
            </p>
          </section>

          {/* Phần 2 */}
          <section className="space-y-4">
            <h2 className="font-haffer pt-2 text-lg font-semibold text-white sm:text-xl">
              2. Cách đăng nhập từ một mạng hoặc địa chỉ IP mới
            </h2>
            <p>
              Đầu tiên, hãy nhập email và mật khẩu như trước. Nếu địa chỉ IP đã
              được tin cậy, bạn sẽ được đăng nhập ngay. Nếu đây là IP mới,
              Picare sẽ chuyển biểu mẫu sang bước nhập mã xác minh gồm 6 chữ số
              và gửi mã đến email đang gắn với tài khoản của bạn.
            </p>
            <p>
              Mã có hiệu lực trong 5 phút. Hãy nhập đủ 6 số theo thứ tự trong
              email; giao diện sẽ tự chuyển giữa từng ô số. Nếu chưa nhận được
              mã, bạn có thể yêu cầu gửi lại sau thời gian chờ hiển thị trên màn
              hình. Để tránh gửi nhầm hoặc lạm dụng, mỗi lượt xác minh chỉ được
              gửi lại tối đa 3 lần và mã sai quá nhiều lần sẽ làm yêu cầu hiện
              tại hết hiệu lực.
            </p>
          </section>

          {/* Video minh họa tính năng với hiệu ứng Cinematic Modal */}
          <figure className="my-8 space-y-3 sm:my-10">
            <div
              onClick={() => setIsVideoModalOpen(true)}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              className="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[#0e0b13] shadow-[0_24px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(248,109,43,0.12)] transition-all duration-500 hover:border-white/25 hover:shadow-[0_28px_90px_rgba(0,0,0,0.95),0_0_70px_rgba(248,109,43,0.28)] sm:rounded-2xl"
            >
              {/* Top ambient highlight line */}
              <div className="pointer-events-none absolute inset-x-8 top-0 z-30 h-px bg-gradient-to-r from-transparent via-[#F86D2B]/60 to-transparent" />

              {/* Video preview tự nhiên ban đầu */}
              <div className="relative aspect-video w-full overflow-hidden bg-black/50">
                <video
                  src={VIDEO_URL}
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
              Video 1: Minh họa trải nghiệm xác minh danh tính và đăng nhập an
              toàn trên Picare Client.
            </figcaption>
          </figure>

          {/* Phần 3 */}
          <section className="space-y-4">
            <h2 className="font-haffer pt-2 text-lg font-semibold text-white sm:text-xl">
              3. Trusted IP là gì và có hiệu lực trong bao lâu?
            </h2>
            <p>
              Trusted IP là địa chỉ mạng đã được xác minh thành công. Picare lưu
              lại địa chỉ IP, thông tin trình duyệt hoặc thiết bị, thời điểm xác
              minh và lần sử dụng gần nhất. Mỗi bản ghi mặc định có hiệu lực
              trong 30 ngày; một tài khoản có thể lưu tối đa 10 địa chỉ IP tin
              cậy gần nhất.
            </p>
            <p>
              IP có thể thay đổi khi bạn chuyển từ Wi-Fi công ty sang Wi-Fi tại
              nhà, dùng 4G/5G, bật VPN hoặc nhà mạng cấp lại địa chỉ mạng. Vì
              vậy, cùng một thiết bị vẫn có thể được yêu cầu nhập OTP khi mạng
              thay đổi. Đây là hành vi bình thường và không có nghĩa tài khoản
              của bạn đang gặp lỗi.
            </p>
          </section>

          {/* Phần 4 */}
          <section className="space-y-4">
            <h2 className="font-haffer pt-2 text-lg font-semibold text-white sm:text-xl">
              4. Khi nào Picare yêu cầu đăng nhập lại?
            </h2>
            <p>
              Sau khi đổi mật khẩu thành công, Picare sẽ đăng xuất tài khoản và
              đưa bạn về màn hình đăng nhập. Các phiên đăng nhập cũ trên trình
              duyệt hoặc kết nối thời gian thực cũng không còn hiệu lực. Đây là
              biện pháp cần thiết để người khác không thể tiếp tục sử dụng một
              phiên đã được tạo trước khi mật khẩu thay đổi.
            </p>
            <p>
              Hệ thống cũng yêu cầu đăng nhập lại khi quản trị viên khóa tài
              khoản, đổi vai trò, cập nhật email hoặc thay đổi chính sách bỏ qua
              xác minh IP. Quản trị viên có thể xem danh sách IP đã tin cậy và
              thu hồi toàn bộ danh sách khi nghi ngờ tài khoản đã được sử dụng
              trên một mạng không an toàn.
            </p>
          </section>

          {/* Phần 5: Kết luận */}
          <section className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="font-haffer text-lg font-semibold text-white sm:text-xl">
              5. Hướng dẫn xử lý khi không nhận được mã OTP
            </h2>
            <p>
              Trước tiên, hãy chờ trong ít phút và kiểm tra cả hộp thư Spam hoặc
              Thư rác. Đảm bảo bạn đang mở đúng email được đăng ký với tài khoản
              Picare. Chỉ sử dụng mã mới nhất vì mã cũ có thể không còn hiệu lực
              sau khi bạn yêu cầu gửi lại.
            </p>
            <p>
              Nếu đã hết lượt gửi lại, mã đã hết hạn hoặc không còn truy cập
              được email, hãy quay lại bước đăng nhập để tạo yêu cầu mới. Trong
              trường hợp vẫn không nhận được mã, liên hệ quản trị viên để kiểm
              tra email tài khoản hoặc chính sách xác minh. Nếu màn hình thông
              báo đăng nhập sai quá nhiều lần, hãy chờ hết thời gian được hiển
              thị rồi thử lại. Không chia sẻ OTP với bất kỳ ai, kể cả người tự
              xưng là nhân viên hỗ trợ Picare.
            </p>
          </section>
        </article>

        {/* Chân trang bài viết */}
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
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoSrc={VIDEO_URL}
      />

      <PublicLandingFooter />
    </div>
  );
}
