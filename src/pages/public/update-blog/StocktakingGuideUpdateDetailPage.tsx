import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClipboard,
  FiDownload,
  FiFileText,
  FiPenTool,
  FiSearch,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";

import PublicLandingFooter from "@/components/landing/PublicLandingFooter";
import PublicLandingNavbar from "@/components/landing/PublicLandingNavbar";
import { PATHS } from "@/config/paths";

const steps = [
  {
    number: "01",
    title: "Kế toán tạo đợt",
    description:
      "Chọn kiểm theo kho hoặc theo brand, chọn phạm vi hàng cần kiểm và tạo đợt kiểm kê.",
    icon: FiClipboard,
  },
  {
    number: "02",
    title: "Kế toán kiểm đếm",
    description:
      "In phiếu nếu cần, nhập số lượng thực tế cho tất cả các dòng rồi bấm Kế toán duyệt.",
    icon: FiSearch,
  },
  {
    number: "03",
    title: "Kho kiểm tra lại",
    description:
      "Người phụ trách kho hoặc brand chỉ sửa những số lượng cần điều chỉnh, ghi chú và xác nhận.",
    icon: FiCheckCircle,
  },
  {
    number: "04",
    title: "Ba bên ký biên bản",
    description:
      "Kế toán, Kho và QC/QA ký trực tiếp. Khi đủ chữ ký, đợt kiểm kê hoàn tất và có thể tải biên bản.",
    icon: FiPenTool,
  },
];

const statuses = [
  {
    name: "Kế toán đang kiểm",
    description: "Kế toán nhập số lượng; Kho chưa thể mở chi tiết đợt này.",
  },
  {
    name: "Kho đang kiểm",
    description: "Kế toán đã duyệt; Kho kiểm tra và xác nhận số liệu.",
  },
  {
    name: "Chờ ký biên bản",
    description: "Kho đã xác nhận; ba bên vào trang ký biên bản.",
  },
  {
    name: "Hoàn tất kiểm kê",
    description: "Kế toán, Kho và QC/QA đã ký đủ; có thể tải biên bản PDF.",
  },
  {
    name: "Đã hủy",
    description: "Đợt đã dừng và không tiếp tục kiểm đếm hoặc ký.",
  },
];

const questions = [
  {
    question: "Vì sao tôi chưa mở được chi tiết đợt kiểm kê?",
    answer:
      "Nếu bạn phụ trách Kho, hãy đợi Kế toán nhập đủ số lượng và bấm Kế toán duyệt. Sau đó, mở đợt được giao trong mục Của bạn.",
  },
  {
    question: "Vì sao không tạo được đợt kiểm theo kho?",
    answer:
      "Kho được chọn cần có người phụ trách. Hãy nhờ quản lý gán người phụ trách kho trước khi tạo đợt.",
  },
  {
    question: "Vì sao chưa bấm được Kế toán duyệt?",
    answer:
      "Hãy dùng bộ lọc Chưa kiểm đếm để tìm các dòng còn thiếu số lượng thực tế, nhập đủ rồi thử lại.",
  },
  {
    question: "Khi nào tải được biên bản?",
    answer:
      "Nút tải xuất hiện sau khi Kế toán, Kho và QC/QA đều đã ký. Bạn có thể mở trang ký từ nút Ký biên bản trong chi tiết đợt.",
  },
];

export default function StocktakingGuideUpdateDetailPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Hướng dẫn kiểm kê và ký biên bản | Picare Hub";
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.title = "Picare Hub";
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
            <time dateTime="2026-10-01">01 Tháng 10, 2026</time>
            <span className="text-white/20">/</span>
            <span>8 phút đọc</span>
          </div>
          <h1 className="mt-5 text-2xl leading-snug font-semibold text-white sm:text-3xl md:text-[38px]">
            Hướng dẫn kiểm kê: từ tạo đợt đến ký biên bản
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            Dành cho Kế toán, người phụ trách Kho, người phụ trách brand và
            QC/QA. Mỗi người có một bước rõ ràng để cùng hoàn thành một đợt kiểm
            kê.
          </p>
        </motion.header>

        <article className="mt-8 space-y-12 text-sm leading-7 font-light text-zinc-300 sm:mt-12 sm:text-base">
          <div className="border-l-2 border-[#F86D2B] pl-4 text-sm leading-7 text-zinc-300 sm:pl-5 sm:text-[15px]">
            <strong className="font-semibold text-white">Xem nhanh:</strong> Kế
            toán tạo và kiểm đếm → Kho kiểm tra lại → Kế toán, Kho, QC/QA ký →
            Tải biên bản.
          </div>

          <nav
            aria-label="Nội dung bài viết"
            className="border border-white/10 bg-white/[0.025] p-5"
          >
            <p className="mb-3 text-xs font-semibold text-[#FFA336]">
              TRONG BÀI NÀY
            </p>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <a className="hover:text-[#FFA336]" href="#chon-pham-vi">
                Chọn phạm vi kiểm kê
              </a>
              <a className="hover:text-[#FFA336]" href="#cac-buoc">
                Bốn bước thực hiện
              </a>
              <a className="hover:text-[#FFA336]" href="#vai-tro">
                Ai xem và thao tác được?
              </a>
              <a className="hover:text-[#FFA336]" href="#trang-thai">
                Trạng thái và câu hỏi thường gặp
              </a>
            </div>
          </nav>

          <section id="chon-pham-vi" className="scroll-mt-28 space-y-5">
            <SectionHeading number="1" title="Chọn phạm vi kiểm kê" />
            <p>
              Trong màn hình{" "}
              <strong className="font-semibold text-white">
                Tạo đợt kiểm kê
              </strong>
              , Kế toán chọn một trong hai cách. Sau khi tạo, cả hai đều đi qua
              cùng một quy trình kiểm đếm, xác nhận và ký.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard title="Kiểm theo kho" icon={FiClipboard}>
                Chọn công ty và kho cần kiểm. Kho phải có người phụ trách; người
                đó sẽ tiếp nhận bước kiểm tra của Kho.
              </InfoCard>
              <InfoCard title="Kiểm theo brand" icon={FiUsers}>
                Chọn người phụ trách brand. Các brand do người đó quản lý được
                đưa vào phạm vi kiểm kê tại kho Nguyễn Giản Thanh và Tổng Chấn
                Hưng; người này tiếp nhận bước kiểm tra của Kho.
              </InfoCard>
            </div>
            <p>
              Có thể chọn hàng cần kiểm{" "}
              <strong className="font-semibold text-white">thủ công</strong>{" "}
              hoặc dùng gợi ý{" "}
              <strong className="font-semibold text-white">tự động</strong>.
              Trước khi tạo, hãy xem lại danh sách hàng, lô và phạm vi đã chọn.
              Với kiểm theo brand, cùng một mã hàng có thể xuất hiện ở nhiều
              công ty; hãy kiểm theo từng dòng được hiển thị.
            </p>
          </section>

          <section id="cac-buoc" className="scroll-mt-28 space-y-5">
            <SectionHeading number="2" title="Bốn bước thực hiện" />
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
            <div className="space-y-4">
              <h3 className="font-semibold text-white">
                Khi Kế toán nhập số lượng
              </h3>
              <p>
                Mở chi tiết đợt, có thể in phiếu để đi kiểm hàng. Dùng ô tìm
                kiếm hoặc quét mã vạch để tới đúng sản phẩm, lô hàng. Bộ lọc{" "}
                <strong className="font-semibold text-white">
                  Chưa kiểm đếm
                </strong>{" "}
                giúp tìm nhanh các dòng chưa nhập số, đặc biệt khi danh sách
                dài. Nhập số lượng thực tế cho từng dòng, kể cả khi số lượng là
                0. Chỉ khi đã nhập đủ, Kế toán mới bấm{" "}
                <strong className="font-semibold text-white">
                  Kế toán duyệt
                </strong>{" "}
                để chuyển cho Kho.
              </p>
              <h3 className="font-semibold text-white">Khi Kho kiểm tra lại</h3>
              <p>
                Sau khi Kế toán duyệt, người phụ trách mở đợt trong mục{" "}
                <strong className="font-semibold text-white">Của bạn</strong>.
                Màn hình cho thấy số trên hệ thống, số Kế toán đã đếm và số của
                Kho nếu Kho điều chỉnh. Kho chỉ cần nhập ở những dòng thấy khác,
                có thể thêm ghi chú giải thích; các dòng không sửa vẫn dùng số
                Kế toán đã nhập. Kiểm tra kết quả chênh lệch rồi bấm{" "}
                <strong className="font-semibold text-white">
                  Kho xác nhận
                </strong>
                .
              </p>
              <h3 className="font-semibold text-white">Khi ký biên bản</h3>
              <p>
                Từ chi tiết đợt, bấm{" "}
                <strong className="font-semibold text-white">
                  Ký biên bản
                </strong>{" "}
                để mở trang biên bản toàn màn hình. Kế toán, Kho và QC/QA lần
                lượt bấm biểu tượng ký, nhập tên và vẽ chữ ký. Khi đủ ba chữ ký,
                đợt chuyển sang{" "}
                <strong className="font-semibold text-white">
                  Hoàn tất kiểm kê
                </strong>{" "}
                và nút tải PDF xuất hiện.
              </p>
            </div>
          </section>

          <section id="vai-tro" className="scroll-mt-28 space-y-5">
            <SectionHeading number="3" title="Ai xem và thao tác được?" />
            <div className="space-y-3">
              <RoleRow
                role="Kế toán"
                detail="Tạo đợt, nhập số đếm ban đầu, duyệt và ký phần Kế toán. Kế toán không nhập ghi chú cho từng dòng hàng."
              />
              <RoleRow
                role="Kho / người phụ trách brand"
                detail="Chỉ mở chi tiết sau khi Kế toán duyệt; kiểm tra lại, điều chỉnh nếu cần, ghi chú, xác nhận và ký phần Kho."
              />
              <RoleRow
                role="QC/QA"
                detail="Có thể xem và ký phần QC/QA cho bất kỳ đợt kiểm kê nào, kể cả đợt của nhóm khác."
              />
              <RoleRow
                role="Quản trị viên"
                detail="Có thể xem và xử lý các bước khi cần; riêng quyền xóa đợt kiểm kê chỉ dành cho quản trị viên và luôn có bước xác nhận."
              />
              <RoleRow
                role="CEO"
                detail="Có thể theo dõi danh sách và xem biên bản; không tham gia nhập số hoặc ký thay ba bên."
              />
            </div>
            <p>
              Mục{" "}
              <strong className="font-semibold text-white">
                Kiểm theo kho
              </strong>{" "}
              và{" "}
              <strong className="font-semibold text-white">
                Kiểm theo brand
              </strong>{" "}
              tách danh sách theo phạm vi. Mục{" "}
              <strong className="font-semibold text-white">Của bạn</strong> hiển
              thị các đợt bạn được giao tham gia. Người ở nhóm khác không thấy
              đợt riêng của bạn trong mục này. QC/QA, quản trị viên và CEO có
              thể theo dõi danh sách chung theo quyền được cấp.
            </p>
          </section>

          <section id="trang-thai" className="scroll-mt-28 space-y-5">
            <SectionHeading number="4" title="Theo dõi trạng thái" />
            <div className="divide-y divide-white/10 border border-white/10">
              {statuses.map((status) => (
                <div
                  key={status.name}
                  className="grid gap-1 px-5 py-4 sm:grid-cols-[170px_1fr] sm:gap-4"
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
            <p className="text-sm text-zinc-400">
              Các nút chuyển bước đều có hộp xác nhận trước khi thực hiện.
            </p>
          </section>

          <section className="space-y-5">
            <SectionHeading number="5" title="Câu hỏi thường gặp" />
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

          <div className="flex items-start gap-3 border-l-2 border-[#F86D2B] bg-white/[0.025] p-5 text-sm leading-6 text-zinc-300">
            <FiDownload
              aria-hidden="true"
              className="mt-1 h-4 w-4 shrink-0 text-[#FFA336]"
            />
            <p>
              Biên bản hoàn tất ghi lại kết quả kiểm kê và chữ ký của ba bên.
              Hãy tải PDF và đối chiếu trước khi lưu hồ sơ.
            </p>
          </div>
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
