import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { FiArrowLeft } from "react-icons/fi";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import { PATHS } from "@/config/paths";

export default function OfficeChatUpdateDetailPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const previousTitle = document.title;
    document.title =
      "Ra mắt Picare Chat trên Picare Office · Có gì mới & Lộ trình";
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
              <span className="text-[#5CFFC8]">Tính năng mới</span>
              <span aria-hidden="true" className="text-white/20">
                /
              </span>
              <time dateTime="2026-11-16">16 Tháng 11, 2026</time>
              <span aria-hidden="true" className="text-white/20">
                /
              </span>
              <span>Picare Office</span>
            </div>
            <h1 className="mt-5 text-2xl leading-snug font-semibold text-white sm:text-3xl md:text-[38px]">
              Có gì mới: Ra mắt Picare Chat &amp; Trợ thủ thông báo Pibot trên
              Picare Office
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Không gian giao tiếp nội bộ kết hợp ký duyệt chứng từ trực tiếp
              trong luồng tin nhắn, kiến trúc bảo mật mã hoá AES-256-GCM và lộ
              trình phát triển hệ sinh thái làm việc số tại Picare Office.
            </p>
          </m.header>

          {/* Hình ảnh Poster giới thiệu thay thế cho video hướng dẫn */}
          <m.figure
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-8 overflow-hidden rounded-2xl border border-white/15 bg-[#050507] shadow-2xl"
          >
            <img
              src="/picare-chat-modal-banner.jpg"
              alt="Picare Vietnam | What news | Office — Picare Chat Connect"
              className="block h-auto w-full object-cover select-none"
            />
          </m.figure>

          <article className="mt-10 space-y-10 text-sm leading-relaxed font-light text-zinc-300 sm:mt-12 sm:text-base">
            <div className="border border-white/10 bg-white/[0.025] p-5 text-sm leading-relaxed italic sm:text-[15px]">
              Picare Office chính thức giới thiệu phân hệ{" "}
              <strong className="font-medium text-white not-italic">
                Picare Chat
              </strong>{" "}
              — hợp nhất trao đổi công việc, chia sẻ tài nguyên đa phương tiện,
              ký duyệt đơn chi phí tức thì và tiếp nhận thông báo tự động trên
              cùng một nền tảng bảo mật nội bộ.
            </div>

            {/* PHẦN 1: TÍNH NĂNG MỚI & BẢO MẬT */}
            <section className="space-y-6" aria-labelledby="office-chat-features">
              <h2
                id="office-chat-features"
                className="pt-2 text-lg font-semibold text-white sm:text-xl"
              >
                1. Tính năng mới: Picare Chat &amp; Hệ thống Bảo mật
              </h2>

              <div className="space-y-5 text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">
                    1.1. Không gian Cá nhân, Nhóm &amp; Đại gia đình - Picare
                    Group
                  </h3>
                  <p>
                    Hệ thống tách bạch rõ hai luồng{" "}
                    <strong className="font-medium text-white">Cá nhân</strong>{" "}
                    và <strong className="font-medium text-white">Nhóm</strong>{" "}
                    kèm huy hiệu đếm số lượng hội thoại chưa đọc ngay trên từng
                    tab. Toàn bộ thành viên trong công ty được tự động đồng bộ
                    vào nhóm chính thức{" "}
                    <strong className="font-medium text-white">
                      Đại gia đình - Picare Group
                    </strong>{" "}
                    ngay khi tài khoản được khởi tạo. Đối với các nhóm dự án tự
                    tạo, Quản trị viên (người tạo nhóm) có quyền cập nhật tên
                    nhóm, ảnh đại diện, mô tả, thêm hoặc xoá thành viên kèm
                    thông báo hệ thống minh bạch; thành viên khi rời nhóm vẫn
                    được giữ nguyên lịch sử tin nhắn trước thời điểm rời, hoặc có
                    thể xoá cuộc trò chuyện ở riêng phía mình.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-white">
                    1.2. Soạn tin thông minh, Nhắc tên (@) &amp; Ký duyệt chi
                    phí (#)
                  </h3>
                  <p>
                    Hỗ trợ gõ{" "}
                    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white">
                      @
                    </code>{" "}
                    để nhắc tên đồng nghiệp (kèm thẻ hover xem nhanh phòng ban,
                    chức vụ và nút nhắn riêng) hoặc dùng{" "}
                    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white">
                      @Tất cả
                    </code>{" "}
                    để thông báo nhanh cho toàn bộ thành viên trong nhóm. Đặc
                    biệt, khi gõ phím{" "}
                    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white">
                      #
                    </code>{" "}
                    ngay trong lúc soạn thảo, danh sách{" "}
                    <strong className="font-medium text-white">
                      Đơn duyệt chi phí
                    </strong>{" "}
                    sẽ hiện ra và lọc tức thì theo mã đơn hoặc nội dung; sau khi
                    chọn đơn và gửi tin nhắn, hệ thống tự động tạo thẻ công việc
                    hiển thị trạng thái thực cùng nút{" "}
                    <strong className="font-medium text-white">
                      Ký duyệt ngay
                    </strong>{" "}
                    nếu đến lượt của bạn. Khung nhập hỗ trợ tối đa 1.000 ký
                    tự/tin nhắn, tự động chuyển URL thành thẻ Link Preview, trả
                    lời trích dẫn (Reply), ghim nhiều tin nhắn quan trọng, thả
                    biểu cảm (Reaction), thu hồi tin nhắn và tìm kiếm nội dung
                    trực tiếp trong hội thoại.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-white">
                    1.3. Ghi âm Voice Chat &amp; Trình phát sóng âm
                  </h3>
                  <p>
                    Tích hợp tính năng thu âm tin nhắn thoại trực tiếp ngay tại
                    thanh soạn tin với hiển thị thời lượng và sóng âm trực
                    quan. Người dùng có thể thu nhanh, huỷ hoặc gửi trực tiếp
                    file âm thanh lên hệ thống để đồng nghiệp phát lại ngay
                    trong khung chat với tốc độ ổn định.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-white">
                    1.4. Upload hàng loạt Ảnh, Video Bento Grid &amp; Tài liệu
                  </h3>
                  <p>
                    Cho phép chọn hoặc dán trực tiếp nhiều hình ảnh, video và
                    tài liệu văn phòng (PDF, Word, Excel, nén ZIP...) trong cùng
                    một lượt gửi. Khi gửi nhiều ảnh hoặc video, khung chat tự
                    động bố trí thành lưới{" "}
                    <strong className="font-medium text-white">
                      Bento Grid
                    </strong>{" "}
                    tối ưu theo số lượng tệp; bấm vào bất kỳ ảnh/video nào để mở
                    trình xem Lightbox toàn màn hình có nút chuyển qua lại. Với
                    các tệp tài liệu ngoài, mỗi tệp được tách dòng rõ ràng kèm
                    badge nhận diện định dạng, dung lượng, xem trước nhanh và
                    tải xuống tức thì.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-white">
                    1.5. Danh bạ nhân sự &amp; Thư viện lưu trữ hội thoại
                  </h3>
                  <p>
                    Thanh tiện ích bên trái giúp chuyển nhanh giữa danh sách hội
                    thoại,{" "}
                    <strong className="font-medium text-white">
                      Danh bạ toàn công ty
                    </strong>{" "}
                    (tra cứu theo phòng ban và mở chat nhanh) và{" "}
                    <strong className="font-medium text-white">
                      Thư viện tài nguyên
                    </strong>{" "}
                    tổng hợp toàn bộ ảnh, video, tài liệu và đường dẫn đã chia
                    sẻ trong từng cuộc trò chuyện.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4">
                  <h3 className="font-semibold text-emerald-300">
                    1.6. Bảo mật dữ liệu chuẩn AES-256-GCM
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                    Toàn bộ nội dung tin nhắn và tệp đính kèm lưu trữ qua máy
                    chủ đều được mã hoá bằng thuật toán{" "}
                    <span className="font-mono font-medium text-white">
                      AES-256-GCM
                    </span>{" "}
                    kèm xác thực toàn vẹn dữ liệu theo ngữ cảnh từng hội thoại,
                    đảm bảo an toàn thông tin vận hành nội bộ trên toàn hệ thống
                    Picare.
                  </p>
                </div>
              </div>
            </section>

            {/* PHẦN 2: CÁC MẶT HẠN CHẾ & LƯU Ý THỬ NGHIỆM */}
            <section className="space-y-4" aria-labelledby="office-chat-limits">
              <h2
                id="office-chat-limits"
                className="pt-2 text-lg font-semibold text-white sm:text-xl"
              >
                2. Các mặt hạn chế &amp; Lưu ý phiên bản thử nghiệm
              </h2>

              <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-5 text-sm leading-relaxed text-amber-100/90">
                <ul className="space-y-3">
                  <li>
                    <strong className="font-semibold text-amber-200">
                      • Giới hạn hiện tại của trợ thủ Pibot:
                    </strong>{" "}
                    Trong giai đoạn đầu, phòng chat{" "}
                    <strong className="font-semibold text-white">Pibot</strong>{" "}
                    mới chỉ đang là phiên bản thử nghiệm với vai trò nhắc nhở
                    đơn hàng / thông báo đơn duyệt chi phí mới và nhắc ký duyệt
                    theo đúng phân quyền (hoạt động ở chế độ chỉ đọc, chưa hỗ trợ
                    nhắn tin hai chiều).
                  </li>
                  <li>
                    <strong className="font-semibold text-amber-200">
                      • Chờ thông báo từ Phòng Nhân sự &amp; Phê duyệt của Sếp:
                    </strong>{" "}
                    Do đây là cụm tính năng mới, quyền nhắn tin hiện tạm giới
                    hạn trước cho Admin và CEO; mọi người vẫn có thể vào xem,
                    tạo nhóm và tạo phòng chat cá nhân bình thường. Hệ thống sẽ
                    đợi{" "}
                    <strong className="font-semibold text-white">
                      thông báo chính thức của Phòng Nhân sự (HR)
                    </strong>{" "}
                    cũng như{" "}
                    <strong className="font-semibold text-white">
                      sự chấp thuận của Sếp
                    </strong>{" "}
                    trước khi đưa vào hoạt động chính thức cho toàn thể nhân sự.
                  </li>
                </ul>
              </div>
            </section>

            {/* PHẦN 3: DỰ ĐỊNH UPDATE TRONG TƯƠNG LAI */}
            <section
              className="space-y-5"
              aria-labelledby="office-chat-roadmap"
            >
              <h2
                id="office-chat-roadmap"
                className="pt-2 text-lg font-semibold text-white sm:text-xl"
              >
                3. Dự định cập nhật trong tương lai
              </h2>

              <div className="space-y-5 text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
                <p>
                  Trong các đợt nâng cấp tiếp theo, Picare Office sẽ tiếp tục mở
                  rộng sâu hơn để trở thành trung tâm điều phối công việc hợp
                  nhất cho toàn công ty, tập trung vào 5 nhóm tính năng trọng
                  điểm:
                </p>

                <div className="space-y-1.5">
                  <h3 className="font-semibold text-white">
                    • Gọi thoại (Audio Call) và Video Call trực tiếp trong Chat
                  </h3>
                  <p>
                    Cho phép nhân sự thực hiện cuộc gọi thoại 1-1, gọi nhóm
                    nhanh hoặc họp Video Call độ trễ thấp ngay bên trong cửa sổ
                    trò chuyện mà không cần cài thêm phần mềm bên ngoài, hỗ trợ
                    chia sẻ màn hình, bật/tắt mic linh hoạt và lưu nhật ký cuộc
                    gọi ngay trong mạch hội thoại.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-semibold text-white">
                    • Hệ thống Lịch trung tâm tại Dashboard &amp; Tích hợp vào
                    Chat
                  </h3>
                  <p>
                    Xây dựng phân hệ Lịch làm việc là một tính năng chính ngay
                    tại Dashboard để quản lý lịch họp giao ban, lịch công tác,
                    deadline chứng từ và lịch trình chung của từng phòng ban,
                    đồng bộ trực tiếp vào khung chat để gửi lời mời họp, kiểm
                    tra trùng lịch và bắn nhắc nhở tự động.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-semibold text-white">
                    • Không gian Thảo luận công khai (Public Discussions &amp;
                    Comments)
                  </h3>
                  <p>
                    Cho phép bất kỳ thành viên nào khởi tạo một chủ đề thảo luận
                    công khai về một vấn đề chuyên môn, quy trình hay đề xuất
                    mới; tất cả mọi người đều có thể vào xem bối cảnh đầy đủ,
                    theo dõi và để lại bình luận (comments) trao đổi nhiều tầng,
                    giúp lưu trữ tri thức tập trung và tránh trôi thông tin.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-semibold text-white">
                    • Nâng cấp Pibot thành AI Agent hỗ trợ tác vụ văn phòng
                  </h3>
                  <p>
                    Pibot sẽ được nâng cấp thành AI Agent thông minh hoạt động
                    tương tự trợ lý Gemini trong Chrome: trò chuyện trực tiếp để
                    tự động đặt lịch họp, tạo task công việc, tóm tắt nhanh
                    chuỗi tin nhắn dài, gợi ý câu trả lời (suggest reply) và tra
                    cứu mọi thông tin, quy định nội bộ của công ty.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-semibold text-white">
                    • Tích hợp thông số liên hệ thống từ OMS, WMS, SFA &amp; Tài
                    chính
                  </h3>
                  <p>
                    Kết nối dữ liệu trực tiếp từ các hệ thống vận hành cốt lõi
                    gồm Quản lý đơn hàng (OMS), Quản lý kho bãi (WMS), Hệ thống
                    bán hàng hiện trường (SFA) và Tài chính để trích xuất và gửi
                    nhanh các thông số tổng hợp về doanh thu bán hàng, tồn kho,
                    vận đơn hay dòng tiền ngay vào trong khung chat.
                  </p>
                </div>
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

        <PublicLandingFooter />
      </div>
    </LazyMotion>
  );
}
