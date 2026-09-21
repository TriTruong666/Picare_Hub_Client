import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { FiArrowLeft, FiClock } from "react-icons/fi";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import { PATHS } from "@/config/paths";
import securityMockupImg from "@/assets/images/saleforce_intro.png";

export default function SecurityOfficeUpdateDetailPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      "Nâng cấp toàn diện bảo mật phục vụ Picare Office (Mới) | Picare Engineering";

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
            <span className="text-[#FFA336]">Kỹ thuật & Bảo mật Hệ thống</span>
            <span className="text-white/20">/</span>
            <time dateTime="2026-09-21">21 Tháng 09, 2026</time>
            <span className="text-white/20">/</span>
            <span>Bản phát hành v2.5.0-sec</span>
          </div>

          <h1 className="mt-5 text-2xl sm:text-3xl md:text-[38px] leading-snug font-semibold text-white">
            Hệ thống vừa nâng cấp toàn diện về mặt bảo mật để phục vụ cho hệ thống Picare Office (Mới)
          </h1>

          <div className="mt-5 flex items-center justify-between text-xs text-white/45 border-t border-white/10 pt-4">
            <span>Tác giả: Nhóm Kỹ thuật Bảo mật & Hạ tầng Picare Core</span>
            <span className="inline-flex items-center gap-1.5">
              <FiClock size={13} aria-hidden="true" />
              6 phút đọc học thuật
            </span>
          </div>
        </motion.header>

        {/* Nội dung bài viết học thuật: Tập trung văn bản chuyên sâu */}
        <article className="mt-8 sm:mt-12 space-y-10 text-sm sm:text-base leading-relaxed font-light text-zinc-300">
          {/* Tóm tắt mở đầu (Abstract) */}
          <div className="border-l-2 border-[#F86D2B] pl-4 sm:pl-5 text-zinc-300 italic text-sm sm:text-[15px] leading-relaxed">
            Tóm lược: Bài viết này trình bày chi tiết về kiến trúc bảo mật thế hệ mới được triển khai trên toàn bộ hệ thống lõi Picare Hub. Trọng tâm của đợt tái cấu trúc này là phục vụ việc tích hợp thông suốt và bảo vệ dữ liệu tối mật cho phân hệ Picare Office, thông qua việc áp dụng mô hình Zero Trust, mật mã hóa dữ liệu tại chỗ (Data-at-Rest) bằng chuẩn AES-256-GCM, và cơ chế kiểm soát phiên làm việc theo ngữ cảnh thích ứng.
          </div>

          {/* Phần 1 */}
          <section className="space-y-4">
            <h2 className="font-haffer text-lg sm:text-xl font-semibold text-white pt-2">
              1. Bối cảnh kỹ thuật và thách thức an ninh trong phân hệ văn phòng số
            </h2>
            <p>
              Khi doanh nghiệp mở rộng quy mô hoạt động, các luồng thông tin hành chính, tài liệu nhân sự, dữ liệu hợp đồng pháp lý và quy trình ký duyệt nội bộ trở thành tài sản số mang tính sống còn. Trong mô hình bảo vệ chu vi truyền thống (Perimeter-based Security), việc người dùng đã đăng nhập thành công thường mặc định trao quyền truy cập rộng rãi vào các tài nguyên nội bộ. Điều này tiềm ẩn nguy cơ nghiêm trọng khi một thiết bị làm việc từ xa bị xâm nhập hoặc thông tin đăng nhập bị rò rỉ qua các cuộc tấn công phi kỹ thuật.
            </p>
            <p>
              Với sự ra đời của phân hệ văn phòng thông minh Picare Office, yêu cầu đặt ra là phải xây dựng một hàng rào kỹ thuật vừa đảm bảo khả năng cộng tác linh hoạt giữa các phòng ban, vừa duy trì tính cô lập nghiêm ngặt giữa các luồng dữ liệu nghiệp vụ nhạy cảm mà không làm suy giảm hiệu năng thao tác của người sử dụng.
            </p>
          </section>

          {/* Phần 2 */}
          <section className="space-y-4">
            <h2 className="font-haffer text-lg sm:text-xl font-semibold text-white pt-2">
              2. Nguyên lý Zero Trust và kiểm soát phiên làm việc thích ứng
            </h2>
            <p>
              Đội ngũ kỹ thuật Picare Core đã triển khai kiến trúc Zero Trust dựa trên phương châm cốt lõi: không tin tưởng bất kỳ tác nhân nào một cách mặc định, dù là bên trong hay bên ngoài mạng nội bộ. Mọi yêu cầu truy vấn đến phân hệ Picare Office đều phải trải qua quá trình thẩm định danh tính liên tục dựa trên ngữ cảnh phiên làm việc.
            </p>
            <p>
              Cụ thể, hệ thống phân tích đồng thời nhiều chiều dữ liệu: dải địa chỉ mạng (IP Range), dấu vân tay trình duyệt (Browser Fingerprint), vị trí địa lý xấp xỉ và nhịp độ thao tác. Khi phát hiện một yêu cầu phát sinh từ một địa chỉ IP chưa từng được xác thực trước đó, hệ thống lập tức kích hoạt cơ chế thử thách qua kênh phụ (Out-of-band Verification) bằng mã OTP 6 chữ số có thời gian tồn tại ngắn. Sau khi hoàn tất, bản ghi địa chỉ mạng tin cậy (Trusted IP) được gán thời hạn tự hủy nghiêm ngặt, ngăn chặn triệt để hành vi tái sử dụng phiên trái phép.
            </p>
          </section>

          {/* Hình ảnh minh họa ở giữa văn bản để test UI theo yêu cầu */}
          <figure className="my-8 sm:my-10 space-y-3">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#17131C]">
              <img
                src={securityMockupImg}
                alt="Kiến trúc bảo mật phân hệ Picare Office"
                className="h-auto w-full object-cover select-none"
              />
            </div>
            <figcaption className="text-center text-xs font-light text-zinc-400">
              Hình 1: Mô hình phân tầng kiến trúc xác thực đa lớp và luồng truyền nhận chứng từ an toàn giữa Picare Hub và phân hệ Picare Office.
            </figcaption>
          </figure>

          {/* Phần 3 */}
          <section className="space-y-4">
            <h2 className="font-haffer text-lg sm:text-xl font-semibold text-white pt-2">
              3. Cơ chế mã hóa kép AES-256-GCM và kênh truyền bảo vệ thời gian thực
            </h2>
            <p>
              Đối với dữ liệu lưu trữ (Data-at-Rest), toàn bộ tệp tài liệu, văn bản trình ký và dữ liệu số hóa của Picare Office đều được áp dụng mô hình mã hóa phong bì (Envelope Encryption). Mỗi văn bản được bảo vệ bởi một khóa dữ liệu riêng biệt (Data Encryption Key - DEK), sau đó khóa này được mã hóa lại bằng khóa gốc (Key Encryption Key - KEK) quản lý trong hệ thống phần cứng chuyên dụng. Giải thuật AES-256 ở chế độ GCM (Galois/Counter Mode) cung cấp đồng thời tính bí mật và tính toàn vẹn xác thực, giúp phát hiện ngay lập tức bất kỳ sự can thiệp trái phép nào vào nội dung tệp.
            </p>
            <p>
              Trên tầng mạng và truyền dẫn (Data-in-Transit), toàn bộ giao tiếp giữa máy trạm và máy chủ xử lý phân hệ Office được thiết lập qua giao thức TLS 1.3 với bộ mã hóa hoàn hảo về bảo mật chuyển tiếp (Perfect Forward Secrecy). Kênh kết nối WebSocket phục vụ tác vụ cập nhật thời gian thực được tinh chỉnh để duy trì độ trễ gói tin dưới 80 mili-giây, đảm bảo trải nghiệm ký duyệt số tức thì ngay cả khi truyền tải các bộ hồ sơ pháp lý dung lượng lớn.
            </p>
          </section>

          {/* Phần 4 */}
          <section className="space-y-4">
            <h2 className="font-haffer text-lg sm:text-xl font-semibold text-white pt-2">
              4. Chuỗi sự kiện kiểm toán bất biến (Immutable Audit Trail)
            </h2>
            <p>
              Tính chống chối bỏ (Non-repudiation) là một yêu cầu mang tính pháp lý trong quản trị văn phòng số. Để giải quyết bài toán này, hệ thống nhật ký sự kiện đã được thiết kế lại thành chuỗi băm thời gian được ký số mật mã học. Mỗi hành động: từ việc xem trước tài liệu, tải xuống bản hợp đồng, cho đến thao tác gắn con dấu điện tử, đều phát sinh một bản ghi kiểm toán kèm theo dấu thời gian nguyên tử và chữ ký số của hệ thống.
            </p>
            <p>
              Kiến trúc này đảm bảo rằng không một cá nhân nào, kể cả người có quyền quản trị cơ sở dữ liệu cao nhất, có thể xóa sửa hoặc ngụy tạo lịch sử thao tác trong quá khứ. Điều này mang lại sự an tâm tuyệt đối cho các tổ chức, doanh nghiệp khi cần phục vụ công tác thanh tra hoặc đối soát quy trình tuân thủ nội bộ.
            </p>
          </section>

          {/* Phần 5: Kết luận */}
          <section className="space-y-4 border-t border-white/10 pt-6">
            <h2 className="font-haffer text-lg sm:text-xl font-semibold text-white">
              5. Đánh giá nghiệm thu và lộ trình kế tiếp
            </h2>
            <p>
              Bản nâng cấp bảo mật v2.5.0-sec đã vượt qua chuỗi bài kiểm thử áp lực với kịch bản mô phỏng 50.000 kết nối đồng thời và các thử nghiệm thâm nhập (Penetration Testing) độc lập. Kết quả ghi nhận hệ thống vận hành ổn định, không phát sinh điểm nghẽn mã hóa và sẵn sàng đón nhận lượng truy cập lớn từ các doanh nghiệp chuẩn bị kích hoạt phân hệ Picare Office.
            </p>
            <p>
              Trong các giai đoạn phát triển tiếp theo, đội ngũ kỹ thuật sẽ tiếp tục tích hợp thêm các công nghệ xác thực sinh trắc học FIDO2/WebAuthn và cơ chế kiểm soát rò rỉ dữ liệu thông minh (Smart DLP), hoàn thiện mục tiêu kiến tạo một không gian làm việc số an toàn, hiện đại và chuẩn mực.
            </p>
          </section>
        </article>

        {/* Chân trang bài viết */}
        <div className="mt-14 border-t border-white/10 pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-normal text-white/50">
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

          <span>Ban Công nghệ & Bảo mật Picare Hub</span>
        </div>
      </main>

      <PublicLandingFooter />
    </div>
  );
}
