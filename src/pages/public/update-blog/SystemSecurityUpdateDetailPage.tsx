import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import { PATHS } from "@/config/paths";

const CVE_URL = "https://access.redhat.com/security/cve/cve-2026-98432";

export default function SystemSecurityUpdateDetailPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Bản cập nhật bảo mật hệ thống Picare Client · 03/11/2026";
    window.scrollTo(0, 0);
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const lenis = reduceMotion
      ? null
      : new Lenis({
          lerp: 0.075,
          wheelMultiplier: 0.85,
          touchMultiplier: 1.6,
          smoothWheel: true,
          autoRaf: false,
        });
    const updateTicker = (time: number) => lenis?.raf(time * 1000);
    if (lenis) gsap.ticker.add(updateTicker);
    return () => {
      document.title = previousTitle;
      window.removeEventListener("scroll", onScroll);
      gsap.ticker.remove(updateTicker);
      lenis?.destroy();
    };
  }, [reduceMotion]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="font-haffer min-h-screen overflow-x-hidden bg-[#120F17] text-white selection:bg-[#F86D2B] selection:text-white">
        <PublicLandingNavbar isDarkBg={isScrolled} showNoticeBanner={false} />
        <main className="mx-auto max-w-3xl px-4 pt-28 pb-32 sm:px-6 sm:pt-32 lg:pt-36">
          <m.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
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
          </m.div>

          <m.header
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.65,
              delay: 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-8 border-b border-white/10 pb-8 sm:mt-10 sm:pb-10"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs font-normal text-white/45">
              <span className="text-[#FFA336]">Bảo mật</span>
              <span aria-hidden="true" className="text-white/20">
                /
              </span>
              <time dateTime="2026-11-03">03 Tháng 11, 2026</time>
              <span aria-hidden="true" className="text-white/20">
                /
              </span>
              <span>Cập nhật toàn hệ thống</span>
            </div>
            <h1 className="mt-5 text-2xl leading-snug font-semibold text-white sm:text-3xl md:text-[38px]">
              Bản cập nhật bảo mật hệ thống Picare Client
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Tăng cường bảo vệ tài nguyên nội bộ, siết chặt quyền truy cập và
              triển khai kế hoạch bảo trì an toàn hạ tầng.
            </p>
          </m.header>

          <article className="mt-8 space-y-10 text-sm leading-relaxed font-light text-zinc-300 sm:mt-12 sm:text-base">
            <div className="border border-white/10 bg-white/[0.025] p-5 text-sm leading-relaxed italic sm:text-[15px]">
              Phòng IT Picare Việt Nam tăng cường bảo vệ Hub, Salesforce, WMS,
              OMS và Office trước nguy cơ bot thu thập mã ứng dụng và các yêu
              cầu truy cập không hợp lệ đến máy chủ. Bản cập nhật tập trung vào
              bảo vệ tài nguyên ứng dụng, quản lý quyền sử dụng và tăng cường an
              toàn vận hành.
            </div>

            <AccessProtectionSection />

            <PrivateDeliverySection />

            <AutomationMonitoringSection />

            <InfrastructureMaintenanceSection />

            <UserActionsSection />

            <aside
              className="space-y-3 border-t border-white/10 pt-6 text-xs leading-relaxed text-zinc-400"
              aria-label="Nguồn tham khảo"
            >
              <p className="font-medium text-zinc-300">Nguồn tham khảo</p>
              <p>
                <a
                  href={CVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-white"
                >
                  Red Hat · CVE-2026-98432
                </a>
                . Thông tin lỗ hổng không thay thế kết quả kiểm tra của nhà cung
                cấp hạ tầng.
              </p>
            </aside>
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
        <PublicLandingFooter />
      </div>
    </LazyMotion>
  );
}

function AccessProtectionSection() {
  return (
    <section className="space-y-4" aria-labelledby="security-automation">
      <h2
        id="security-automation"
        className="pt-2 text-lg font-semibold text-white sm:text-xl"
      >
        1. Tăng cường bảo vệ trước hoạt động thu thập tự động
      </h2>
      <p>
        Phòng IT Picare Việt Nam triển khai đợt nâng cấp nhằm bảo vệ tài nguyên
        nội bộ trước nguy cơ bị thu thập, sao chép hoặc tái sử dụng ngoài phạm
        vi cho phép. Các kịch bản phòng vệ bao gồm việc sử dụng bot, công cụ tự
        động và tác nhân AI để tiếp cận tài nguyên ứng dụng hoặc tạo những yêu
        cầu không phù hợp với mục đích sử dụng hệ thống.
      </p>
      <p>
        Trọng tâm của bản cập nhật là củng cố khả năng kiểm soát truy cập, bảo
        vệ thành phần ứng dụng và duy trì sự ổn định của dịch vụ. Những yêu cầu
        sử dụng tài nguyên ngoài phạm vi công việc cần được phòng IT xem xét và
        phê duyệt trước khi thực hiện.
      </p>
    </section>
  );
}

function PrivateDeliverySection() {
  return (
    <section className="space-y-4" aria-labelledby="security-delivery">
      <h2
        id="security-delivery"
        className="pt-2 text-lg font-semibold text-white sm:text-xl"
      >
        2. Củng cố các lớp bảo vệ tài nguyên nội bộ
      </h2>
      <p>
        Picare bổ sung các biện pháp kiểm soát ở nhiều lớp trong quá trình vận
        hành ứng dụng, từ quản lý quyền sử dụng đến bảo vệ tài nguyên phát hành.
        Các thay đổi được triển khai trên Hub, Salesforce, WMS, OMS và Office để
        tăng tính nhất quán trong bảo vệ hệ thống.
      </p>
      <p>
        Việc cung cấp tài khoản phục vụ công việc không bao gồm sự chấp thuận
        cho hoạt động sao chép, chuyển giao hoặc đưa tài nguyên nội bộ vào dịch
        vụ bên ngoài. Yêu cầu này áp dụng cả khi thao tác được thực hiện trực
        tiếp lẫn thông qua bot, trợ lý AI hoặc công cụ do bên thứ ba cung cấp.
      </p>
      <p>
        Các luồng nghiệp vụ và tính năng chia sẻ được cho phép tiếp tục được
        phục vụ theo phạm vi thiết kế. Người dùng thực hiện công việc qua giao
        diện chính thức và liên hệ bộ phận IT khi cần hỗ trợ truy cập.
      </p>
    </section>
  );
}

function AutomationMonitoringSection() {
  return (
    <section className="space-y-4" aria-labelledby="security-monitoring">
      <h2
        id="security-monitoring"
        className="pt-2 text-lg font-semibold text-white sm:text-xl"
      >
        3. Rà soát hoạt động và quản lý công cụ tự động
      </h2>
      <p>
        Picare duy trì giám sát hoạt động truy cập để phục vụ rà soát nguy cơ
        thu thập dữ liệu tự động, bao gồm hoạt động có sử dụng bot và tác nhân
        AI. Phòng IT đối soát thông tin vận hành khi cần để đánh giá các yêu cầu
        truy cập và xử lý những trường hợp không phù hợp với phạm vi được cấp
        phép.
      </p>
      <p>
        Việc đánh giá dựa trên bối cảnh sử dụng và thông tin được kiểm chứng.
        Người dùng không tự ý giao quyền truy cập hệ thống cho bot, tác nhân AI
        hoặc dịch vụ bên ngoài để thu thập, phân tích hay tái dựng tài nguyên
        nội bộ. Các nhu cầu ứng dụng AI vào công việc cần được thống nhất trước
        về phạm vi dữ liệu, quyền sử dụng và yêu cầu bảo mật.
      </p>
      <p>
        Trường hợp phát sinh lỗi trong quá trình làm việc, vui lòng báo qua kênh
        hỗ trợ nội bộ để được kiểm tra. Không tự triển khai công cụ quét, kiểm
        thử hoặc thu thập dữ liệu trên hệ thống khi chưa được ủy quyền.
      </p>
    </section>
  );
}

function InfrastructureMaintenanceSection() {
  return (
    <section className="space-y-4" aria-labelledby="security-maintenance">
      <h2
        id="security-maintenance"
        className="pt-2 text-lg font-semibold text-white sm:text-xl"
      >
        4. Kế hoạch tạm dừng toàn bộ hệ thống để bảo trì bảo mật
      </h2>
      <p>
        Picare chủ trì kế hoạch tạm dừng toàn bộ hệ thống trong cửa sổ bảo trì
        nhằm phối hợp nhà cung cấp VPS rà soát và xử lý rủi ro liên quan đến
        CVE-2026-98432. Trong khung bảo trì, các máy chủ sẽ được tạm dừng để
        thực hiện cập nhật và kiểm tra trước khi khôi phục dịch vụ.
      </p>
      <dl className="space-y-4 border border-white/10 bg-white/[0.025] p-5 text-sm leading-relaxed">
        <div className="space-y-1">
          <dt className="font-medium text-white">
            Lịch dừng máy chủ để cập nhật
          </dt>
          <dd>
            <time dateTime="2026-11-05T17:00:00+07:00">17h00</time>
            {" – "}
            <time dateTime="2026-11-05T22:00:00+07:00">
              22h00, ngày 05/11/2026
            </time>
            {" (giờ Việt Nam, UTC+7)."}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="font-medium text-white">Thời gian xử lý dự kiến</dt>
          <dd>Khoảng 15–30 phút/máy chủ.</dd>
        </div>
        <div className="space-y-1">
          <dt className="font-medium text-white">Trường hợp phát sinh lỗi</dt>
          <dd>
            Nếu phát sinh lỗi trong quá trình cập nhật, thời gian xử lý có thể
            kéo dài từ 2 đến 3 tiếng. Thời điểm khôi phục thực tế sẽ được cập
            nhật qua kênh thông báo chính thức của Picare.
          </dd>
        </div>
      </dl>
      <p>
        Theo Red Hat, CVE-2026-98432 liên quan đến cơ chế xử lý kết nối IPv4 TCP
        trong Linux kernel. Lỗi có thể gây gián đoạn dịch vụ, hỏng bộ nhớ hoặc
        thực thi mã từ xa. Red Hat xếp mức nghiêm trọng Critical đối với Red Hat
        Enterprise Linux; mức ảnh hưởng thực tế cần được đối chiếu với hạ tầng
        đang sử dụng.
      </p>
      <p>
        Picare điều phối đợt xử lý, kiểm tra khả năng phục hồi và xác nhận dịch
        vụ trước khi mở lại. Việc cập nhật, vá lỗi ở tầng VPS được phối hợp thực
        hiện với nhà cung cấp hạ tầng. Thông báo này không xác nhận máy chủ
        Picare thuộc diện bị ảnh hưởng hoặc bản vá đã hoàn tất; trạng thái sẽ
        được cập nhật sau khi có kết quả kiểm tra và xác nhận triển khai.
      </p>
      <a
        href={CVE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-[#FFA336] underline underline-offset-4 hover:text-white"
      >
        Thông tin CVE-2026-98432 từ Red Hat
        <FiArrowUpRight aria-hidden="true" />
      </a>
    </section>
  );
}

function UserActionsSection() {
  return (
    <section
      className="space-y-4 border-t border-white/10 pt-6"
      aria-labelledby="security-actions"
    >
      <h2
        id="security-actions"
        className="text-lg font-semibold text-white sm:text-xl"
      >
        5. Những việc người dùng cần thực hiện
      </h2>
      <ul className="list-disc space-y-3 pl-5 marker:text-[#FFA336]">
        <li>
          Hoàn tất và lưu công việc trước thời điểm bảo trì được thông báo.
        </li>
        <li>
          Chỉ đăng nhập tại tên miền chính thức; không cung cấp tài khoản hoặc
          phiên làm việc cho dịch vụ bên ngoài.
        </li>
        <li>
          Nếu được yêu cầu đăng nhập lại, sử dụng quy trình xác thực thông
          thường. Khi không vào được phân hệ, liên hệ bộ phận IT để kiểm tra
          quyền.
        </li>
        <li>
          Không thử vượt qua giới hạn truy cập hoặc tải lặp lại khi hệ thống
          đang bảo trì.
        </li>
        <li>
          Báo lỗi và nhu cầu sử dụng tài nguyên qua kênh hỗ trợ nội bộ, kèm thời
          điểm và mô tả; không gửi mật khẩu, OTP hoặc cookie phiên.
        </li>
      </ul>
      <p>
        Picare ưu tiên tính an toàn, khả năng khôi phục và sự ổn định của hệ
        thống. Vui lòng theo dõi thông báo tiếp theo để cập nhật lịch bảo trì và
        trạng thái dịch vụ.
      </p>
    </section>
  );
}
