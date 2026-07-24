import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiChevronRight,
  FiFileText,
  FiFolder,
  FiGrid,
  FiMenu,
  FiShield,
  FiX,
} from "react-icons/fi";
import { PATHS } from "@/config/paths";
import "./landing-page-test.css";

const navigation = [
  { label: "Nền tảng", href: "#platform" },
  { label: "Quy trình", href: "#workflow" },
  { label: "Năng lực", href: "#capabilities" },
  { label: "Liên hệ", href: "#contact" },
];

const consoleViews = [
  { label: "Tổng quan", icon: FiGrid },
  { label: "Hợp đồng", icon: FiFileText },
  { label: "Lưu trữ", icon: FiFolder },
  { label: "Bản quyền", icon: FiShield },
];

const workflowSteps = [
  {
    number: "01",
    label: "SIGNAL",
    title: "Một nguồn dữ liệu chung",
    description:
      "Hợp đồng, giấy phép, tài sản số và QR sản phẩm cùng hoạt động trên một lớp ngữ cảnh thống nhất.",
    stat: "04",
    statLabel: "MODULES CONNECTED",
    accent: "orange",
  },
  {
    number: "02",
    label: "CONTROL",
    title: "Quy trình có kiểm soát",
    description:
      "Phân quyền theo vai trò, lịch sử thao tác và trạng thái phê duyệt giúp mọi thay đổi đều có thể truy vết.",
    stat: "100%",
    statLabel: "TRACEABLE",
    accent: "green",
  },
  {
    number: "03",
    label: "OUTPUT",
    title: "Tiến độ nhìn thấy được",
    description:
      "Bảng điều hành biến hoạt động hằng ngày thành tín hiệu rõ ràng để đội ngũ quyết định nhanh hơn.",
    stat: "24/7",
    statLabel: "OPERATIONAL VIEW",
    accent: "orange",
  },
];

const capabilities = [
  {
    code: "CONTRACT / 01",
    title: "Hợp đồng điện tử",
    copy: "Tạo, kiểm tra, ký kết và theo dõi toàn bộ vòng đời hợp đồng trong một luồng duy nhất.",
    meta: "SIGN · REVIEW · ARCHIVE",
  },
  {
    code: "PRODUCT / 02",
    title: "QR sản phẩm",
    copy: "Định danh sản phẩm, quản lý dữ liệu truy xuất và xuất bản trang thông tin có kiểm soát.",
    meta: "GENERATE · TRACE · PUBLISH",
  },
  {
    code: "SYSTEM / 03",
    title: "Quản trị tập trung",
    copy: "Kiểm soát tài khoản, bản quyền, dung lượng và các Hub thành viên từ một trung tâm vận hành.",
    meta: "ACCESS · LICENSE · STORAGE",
  },
];

const footerColumns = [
  {
    title: "Nền tảng",
    links: ["Hợp đồng", "QR sản phẩm", "Lưu trữ", "Bản quyền"],
  },
  {
    title: "Hệ thống",
    links: ["Hub Center", "Dashboard", "Tài khoản", "Trợ giúp"],
  },
  {
    title: "Picare",
    links: ["Về chúng tôi", "Liên hệ", "Bảo mật", "Điều khoản"],
  },
];

function Sparkline({
  points,
  tone,
  label,
}: {
  points: string;
  tone: "orange" | "green";
  label: string;
}) {
  return (
    <svg
      className={`test-sparkline test-sparkline--${tone}`}
      viewBox="0 0 160 44"
      role="img"
      aria-label={label}
      preserveAspectRatio="none"
    >
      <path className="test-sparkline__grid" d="M0 34.5H160M0 17.5H160" />
      <polyline points={points} />
    </svg>
  );
}

function TestHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="test-header">
      <div className="test-header__inner">
        <a
          className="test-wordmark"
          href="#top"
          aria-label="Picare HUB - đầu trang"
        >
          <span className="test-wordmark__mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>PICARE</span>
          <em>/ HUB</em>
        </a>

        <nav className="test-nav" aria-label="Điều hướng chính">
          {navigation.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="test-header__actions">
          <Link className="test-login-link" to={PATHS.LOGIN_HUB}>
            Đăng nhập
          </Link>
          <Link className="test-button test-button--light" to={PATHS.LOGIN}>
            Vào hệ thống
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <button
          className="test-menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="test-mobile-menu"
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          {menuOpen ? (
            <FiX aria-hidden="true" />
          ) : (
            <FiMenu aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id="test-mobile-menu"
        className={`test-mobile-menu${menuOpen ? "is-open" : ""}`}
      >
        {navigation.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
            <FiChevronRight aria-hidden="true" />
          </a>
        ))}
        <Link to={PATHS.LOGIN} onClick={() => setMenuOpen(false)}>
          Vào hệ thống
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}

function HeroSection() {
  const [activeView, setActiveView] = useState("Tổng quan");
  const [range, setRange] = useState("7D");

  return (
    <section id="top" className="test-hero">
      <div className="test-hero__copy">
        <div className="test-eyebrow test-reveal test-reveal--one">
          <span className="test-status-dot" />
          PICARE HUB / ONLINE
        </div>
        <h1 className="test-reveal test-reveal--two">
          Một trung tâm.
          <br />
          Mọi vận hành.
        </h1>
        <p className="test-reveal test-reveal--three">
          Kết nối hợp đồng, QR sản phẩm, bản quyền và tài liệu vào một hệ thống
          vận hành thống nhất cho doanh nghiệp.
        </p>
        <div className="test-hero__actions test-reveal test-reveal--four">
          <Link className="test-button test-button--light" to={PATHS.LOGIN}>
            Khám phá HUB
            <FiArrowRight aria-hidden="true" />
          </Link>
          <a className="test-button test-button--ghost" href="#platform">
            Xem nền tảng
            <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="test-hero__footnote test-reveal test-reveal--five">
          <span>01</span>
          <p>Control surface for connected operations.</p>
        </div>
      </div>

      <div className="test-console-wrap test-reveal test-reveal--three">
        <div className="test-console" aria-label="Bản xem trước Picare Control">
          <div className="test-console__chrome">
            <div className="test-console__lights" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span>PICARE CONTROL / OPERATIONS</span>
            <div className="test-console__live">
              <span className="test-status-dot" />
              LIVE
            </div>
          </div>

          <div className="test-console__body">
            <aside className="test-console__sidebar">
              <div className="test-console__mini-brand">
                <span className="test-wordmark__mark" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span>PC</span>
              </div>
              <div
                className="test-console__nav"
                aria-label="Chế độ xem bản demo"
              >
                {consoleViews.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={activeView === item.label ? "is-active" : ""}
                      aria-pressed={activeView === item.label}
                      onClick={() => setActiveView(item.label)}
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="test-console__user" aria-hidden="true">
                NH
              </div>
            </aside>

            <div className="test-console__main">
              <div className="test-console__heading">
                <div>
                  <span>WORKSPACE / {activeView.toUpperCase()}</span>
                  <h2>{activeView}</h2>
                </div>
                <div
                  className="test-range-switcher"
                  aria-label="Khoảng thời gian"
                >
                  {["7D", "30D"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={range === item ? "is-active" : ""}
                      aria-pressed={range === item}
                      onClick={() => setRange(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="test-console__metrics">
                <article className="test-metric test-metric--wide">
                  <div className="test-metric__topline">
                    <span>OPERATION FLOW / {range}</span>
                    <b>
                      <span className="test-status-dot test-status-dot--green" />
                      HEALTHY
                    </b>
                  </div>
                  <div className="test-flow">
                    {[
                      ["01", "TẠO", "28"],
                      ["02", "DUYỆT", "12"],
                      ["03", "KÝ", "09"],
                      ["04", "LƯU", "36"],
                    ].map(([step, label, value], index) => (
                      <div className="test-flow__item" key={label}>
                        <span>{step}</span>
                        <strong>{value}</strong>
                        <small>{label}</small>
                        {index < 3 ? <i aria-hidden="true" /> : null}
                      </div>
                    ))}
                  </div>
                </article>

                <article className="test-metric">
                  <span className="test-metric__label">
                    HỢP ĐỒNG ĐANG XỬ LÝ
                  </span>
                  <div className="test-metric__value">
                    28 <small>+12%</small>
                  </div>
                  <Sparkline
                    tone="orange"
                    points="0,35 16,31 30,33 45,20 62,24 78,16 94,19 111,9 127,13 144,5 160,8"
                    label="Xu hướng hợp đồng tăng 12 phần trăm"
                  />
                </article>

                <article className="test-metric">
                  <span className="test-metric__label">TỶ LỆ HOÀN TẤT</span>
                  <div className="test-metric__value">
                    96.8 <small>%</small>
                  </div>
                  <Sparkline
                    tone="green"
                    points="0,28 16,25 31,27 47,20 63,21 80,16 96,17 112,11 128,12 144,7 160,5"
                    label="Tỷ lệ hoàn tất đạt 96.8 phần trăm"
                  />
                </article>

                <article className="test-metric test-metric--activity">
                  <div className="test-metric__topline">
                    <span>ACTIVITY STREAM</span>
                    <b>LAST 24H</b>
                  </div>
                  <div className="test-activity">
                    <div>
                      <span className="test-activity__icon">
                        <FiCheck aria-hidden="true" />
                      </span>
                      <p>
                        Hợp đồng <strong>#PC-0248</strong> đã được ký
                      </p>
                      <time>02m</time>
                    </div>
                    <div>
                      <span className="test-activity__icon test-activity__icon--orange">
                        <FiFileText aria-hidden="true" />
                      </span>
                      <p>
                        Giấy phép <strong>Hub Studio</strong> được gia hạn
                      </p>
                      <time>18m</time>
                    </div>
                    <div>
                      <span className="test-activity__icon">
                        <FiCheck aria-hidden="true" />
                      </span>
                      <p>
                        12 mã QR mới đã được <strong>xuất bản</strong>
                      </p>
                      <time>44m</time>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
        <div className="test-console-note" aria-hidden="true">
          <span>FIG. 01</span>
          <span>LIVE OPERATIONS SURFACE</span>
        </div>
      </div>
    </section>
  );
}

function SignalStrip() {
  return (
    <section className="test-signal-strip" aria-label="Các phân hệ chính">
      <span>POWERING CONNECTED WORK</span>
      <div>
        {[
          "E-CONTRACT",
          "QR TRACE",
          "S3 STORAGE",
          "HUB CLIENTS",
          "LICENSE OPS",
        ].map((item) => (
          <strong key={item}>{item}</strong>
        ))}
      </div>
    </section>
  );
}

function DefinitionSection() {
  return (
    <section id="platform" className="test-definition">
      <div className="test-section-heading">
        <div className="test-eyebrow">
          <span className="test-status-dot" />
          PICARE OPERATING MODEL
        </div>
        <h2>Định hình cách doanh nghiệp vận hành.</h2>
      </div>

      <div className="test-definition__list">
        {workflowSteps.map((step) => (
          <article key={step.number} className="test-definition__row">
            <div className="test-definition__number">{step.number}</div>
            <div className="test-definition__copy">
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
            <div
              className={`test-definition__instrument test-definition__instrument--${step.accent}`}
            >
              <div className="test-definition__stat">
                <strong>{step.stat}</strong>
                <span>{step.statLabel}</span>
              </div>
              <div className="test-definition__scale" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, index) => (
                  <i
                    key={index}
                    style={{
                      transform: `scaleY(${0.35 + ((index * 7) % 11) / 16})`,
                    }}
                  />
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="test-loop">
      <div className="test-loop__copy">
        <div className="test-eyebrow">
          <span className="test-status-dot test-status-dot--green" />
          ONE CONNECTED LOOP
        </div>
        <h2>Từ dữ liệu đến quyết định, không đứt quãng.</h2>
        <p>
          Mỗi tác vụ tạo thêm ngữ cảnh cho tác vụ tiếp theo. Picare HUB giúp đội
          ngũ làm việc trên cùng một sự thật, thay vì những công cụ rời rạc.
        </p>
        <a href="#capabilities">
          Xem toàn bộ năng lực <FiArrowRight aria-hidden="true" />
        </a>
      </div>

      <div className="test-loop__diagram" aria-label="Luồng vận hành Picare">
        <div className="test-loop__core">
          <span>PICARE</span>
          <strong>HUB</strong>
          <small>SHARED CONTEXT</small>
        </div>
        {["TẠO", "KIỂM TRA", "PHÊ DUYỆT", "KÝ", "LƯU TRỮ", "THEO DÕI"].map(
          (item, index) => (
            <div
              key={item}
              className={`test-loop__node test-loop__node--${index + 1}`}
            >
              <span>0{index + 1}</span>
              {item}
            </div>
          ),
        )}
        <div className="test-loop__track" aria-hidden="true" />
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section id="capabilities" className="test-capabilities">
      <div className="test-section-heading test-section-heading--row">
        <div>
          <div className="test-eyebrow">
            <span className="test-status-dot" />
            BUILT FOR REAL OPERATIONS
          </div>
          <h2>Một HUB. Ba lớp năng lực.</h2>
        </div>
        <p>
          Thiết kế để bắt đầu gọn, mở rộng có kiểm soát và giữ toàn bộ hệ thống
          trong tầm nhìn.
        </p>
      </div>

      <div className="test-capabilities__grid">
        {capabilities.map((capability) => (
          <article key={capability.code} className="test-capability">
            <span>{capability.code}</span>
            <div className="test-capability__graphic" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            <h3>{capability.title}</h3>
            <p>{capability.copy}</p>
            <footer>
              <small>{capability.meta}</small>
              <FiArrowRight aria-hidden="true" />
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section id="contact" className="test-cta-shell">
      <div className="test-cta">
        <div className="test-cta__copy">
          <div className="test-eyebrow test-eyebrow--dark">
            <span className="test-status-dot" />
            BUILD WITH PICARE
          </div>
          <h2>Sẵn sàng vận hành trên một hệ thống duy nhất?</h2>
          <p>
            Mở Picare HUB và đưa công việc của đội ngũ vào một luồng rõ ràng, có
            kiểm soát.
          </p>
          <Link className="test-button test-button--dark" to={PATHS.LOGIN}>
            Bắt đầu ngay
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="test-cta__terminal" aria-label="Trạng thái hệ thống">
          <div>
            <span>SYSTEM CHECK</span>
            <b>
              <span className="test-status-dot test-status-dot--green" />
              READY
            </b>
          </div>
          {[
            ["Identity layer", "connected"],
            ["Contract workflow", "online"],
            ["Storage gateway", "synced"],
            ["Audit trail", "recording"],
          ].map(([label, status], index) => (
            <p key={label}>
              <span>0{index + 1}</span>
              {label}
              <strong>{status}</strong>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestFooter() {
  return (
    <footer className="test-footer">
      <div className="test-footer__brand">
        <a className="test-wordmark" href="#top">
          <span className="test-wordmark__mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>PICARE</span>
          <em>/ HUB</em>
        </a>
        <p>Hệ điều hành cho công việc kết nối.</p>
        <span>HO CHI MINH CITY / VIET NAM</span>
      </div>

      <div className="test-footer__links">
        {footerColumns.map((column) => (
          <div key={column.title}>
            <h3>{column.title}</h3>
            {column.links.map((item) => (
              <a key={item} href="#top">
                {item}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="test-footer__bottom">
        <span>© 2026 PICARE. ALL RIGHTS RESERVED.</span>
        <span>
          <i className="test-status-dot test-status-dot--green" />
          ALL SYSTEMS OPERATIONAL
        </span>
      </div>
    </footer>
  );
}

function LandingPageTest() {
  return (
    <main className="test-home">
      <TestHeader />
      <HeroSection />
      <SignalStrip />
      <DefinitionSection />
      <WorkflowSection />
      <CapabilitiesSection />
      <CtaSection />
      <TestFooter />
    </main>
  );
}

export default LandingPageTest;
