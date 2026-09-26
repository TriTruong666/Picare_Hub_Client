import React, { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";
import { FiArrowUpRight, FiHeart } from "react-icons/fi";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import { PATHS } from "@/config/paths";

export interface PublicLandingFooterProps {
  className?: string;
  onOpenLogin?: () => void;
  onOpenClientSelect?: () => void;
}

interface FooterLinkItem {
  label: string;
  href?: string;
  isExternal?: boolean;
  badge?: string;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => void;
}

function GsapFooterLoginButton({
  onClick,
}: {
  onClick?: (e: React.MouseEvent) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    gsap.to(btn, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    const btn = btnRef.current;
    if (!btn) return;
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative inline-flex cursor-pointer items-center px-1 py-1.5 text-[13px] font-normal text-white/75 transition-colors hover:text-white"
    >
      <span className="nav-link-underline">Đăng nhập</span>
    </button>
  );
}

function GsapFooterStartButton({
  onClick,
}: {
  onClick?: (e: React.MouseEvent) => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    gsap.to(btn, {
      x: x * 0.18,
      y: y * 0.18,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const handleMouseEnter = () => {
    const arrow = arrowRef.current;
    const fill = fillRef.current;
    if (arrow) {
      gsap.to(arrow, { x: 3, duration: 0.25, ease: "power2.out" });
    }
    if (fill) {
      gsap.to(fill, {
        scale: 1.05,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const handleMouseLeave = () => {
    const btn = btnRef.current;
    const arrow = arrowRef.current;
    const fill = fillRef.current;
    if (btn) {
      gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: "power2.out" });
    }
    if (arrow) {
      gsap.to(arrow, { x: 0, duration: 0.25, ease: "power2.out" });
    }
    if (fill) {
      gsap.to(fill, {
        scale: 1,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-flex h-9 cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-white px-4 text-[13px] font-medium text-[#120F17] shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-shadow hover:shadow-[0_6px_28px_rgba(255,255,255,0.25)] active:scale-95"
    >
      <span
        ref={fillRef}
        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-neutral-100 to-white opacity-0"
      />
      <span className="relative z-10">Bắt đầu</span>
      <svg
        ref={arrowRef}
        width="13"
        height="13"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="relative z-10"
      >
        <path
          d="M3 8H13M9 4L13 8L9 12"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

interface SocialLinkItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  ariaLabel: string;
  brandColor: string;
}

function GsapSocialButton({ social }: { social: SocialLinkItem }) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const waveLeadingRef = useRef<HTMLSpanElement>(null);
  const waveBodyRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const Icon = social.icon;

  const handleMouseEnter = () => {
    // Sóng nước tràn từ trái sang phải phủ kín toàn bộ nền thành màu trắng
    if (waveLeadingRef.current) {
      gsap.to(waveLeadingRef.current, {
        xPercent: 0,
        duration: 0.32,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (waveBodyRef.current) {
      gsap.to(waveBodyRef.current, {
        xPercent: 0,
        duration: 0.38,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        borderColor: "rgba(255, 255, 255, 0.45)",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        color: social.brandColor,
        duration: 0.28,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const handleMouseLeave = () => {
    // Nước rút êm dịu về bên trái
    if (waveBodyRef.current) {
      gsap.to(waveBodyRef.current, {
        xPercent: -105,
        duration: 0.32,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    }
    if (waveLeadingRef.current) {
      gsap.to(waveLeadingRef.current, {
        xPercent: -105,
        duration: 0.28,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    }
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        borderColor: "rgba(255, 255, 255, 0.1)",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        color: "rgb(163, 163, 163)",
        duration: 0.28,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  return (
    <a
      ref={btnRef}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04] text-neutral-400 active:scale-95 transition-transform"
    >
      {/* Lớp gợn sóng nước dẫn trước */}
      <span
        ref={waveLeadingRef}
        className="pointer-events-none absolute inset-y-0 -left-[30%] w-[160%] rounded-r-[50%] bg-white/40"
        style={{ transform: "translateX(-105%)", willChange: "transform" }}
      />
      {/* Lớp dòng nước chính phủ kín trắng */}
      <span
        ref={waveBodyRef}
        className="pointer-events-none absolute inset-y-0 -left-[20%] w-[140%] rounded-r-[50%] bg-white"
        style={{ transform: "translateX(-105%)", willChange: "transform" }}
      />
      {/* Icon nhận diện thương hiệu */}
      <span
        ref={iconRef}
        className="relative z-10 inline-flex items-center justify-center text-neutral-400"
        style={{ willChange: "color" }}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
    </a>
  );
}

function RainbowEmailLink() {
  const textRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const anim = gsap.to(el, {
      backgroundPosition: "-200% center",
      duration: 5,
      repeat: -1,
      ease: "none",
    });

    return () => {
      anim.kill();
    };
  }, []);

  return (
    <a
      ref={textRef}
      href="mailto:client@picare.vn"
      className="inline-block text-xs font-normal tracking-wide transition-opacity hover:opacity-80"
      style={{
        background:
          "linear-gradient(90deg, #ff3366, #ff7a00, #ffc700, #00e676, #00b0ff, #9d4edd, #ff3366)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
      title="Gửi email tới client@picare.vn"
    >
      client@picare.vn
    </a>
  );
}

export const PublicLandingFooter: React.FC<PublicLandingFooterProps> = ({
  className = "",
  onOpenLogin,
  onOpenClientSelect,
}) => {
  const navigate = useNavigate();

  const handleLoginClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (onOpenLogin) {
      onOpenLogin();
    } else {
      navigate(PATHS.LOGIN);
    }
  };

  const handleStartClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (onOpenClientSelect) {
      onOpenClientSelect();
    } else {
      navigate(PATHS.LOGIN_CLIENT);
    }
  };

  const scrollToElement =
    (elementId: string) =>
    (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      e.preventDefault();
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

  const productLinks: FooterLinkItem[] = [
    { label: "Picare OMS", href: PATHS.CLIENT_OMS },
    { label: "Picare WMS", href: "#" },
    { label: "Picare Saleforce", href: "#", badge: "Mới" },
    { label: "Picare Office", href: "#", badge: "Sắp ra mắt" },
    { label: "Picare Lab", href: "#", badge: "Đang phát triển" },
    { label: "Picare Career", href: "#", badge: "Đang phát triển" },
    { label: "Picare E-Contract", href: "#" },
    { label: "Picare QR Generator", href: "#" },
    { label: "Picare Catalogues", href: "#" },
  ];

  const companyLinks: FooterLinkItem[] = [
    { label: "Picare Vietnam", href: PATHS.HOME },
    { label: "Trung Hạnh", href: "#" },
    { label: "Dermacoon", href: "#" },
    { label: "Độc quyền", href: "#" },
  ];

  const contactLinks: FooterLinkItem[] = [
    {
      label: "FAQ",
      href: "#faq-section",
      onClick: scrollToElement("faq-section"),
    },
    {
      label: "Hỗ trợ",
      href: "mailto:client@picare.vn",
    },
    {
      label: "Demo",
      href: "#quote-card",
      onClick: scrollToElement("quote-card"),
    },
  ];

  const socialLinks: SocialLinkItem[] = [
    {
      name: "Facebook",
      icon: FaFacebookF,
      href: "https://facebook.com/picarevietnam",
      ariaLabel: "Truy cập Facebook Picare",
      brandColor: "#1877F2",
    },
    {
      name: "Instagram",
      icon: FaInstagram,
      href: "https://instagram.com/picarevietnam",
      ariaLabel: "Truy cập Instagram Picare",
      brandColor: "#E1306C",
    },
    {
      name: "TikTok",
      icon: FaTiktok,
      href: "https://tiktok.com/@picarevietnam",
      ariaLabel: "Truy cập TikTok Picare",
      brandColor: "#000000",
    },
    {
      name: "YouTube",
      icon: FaYoutube,
      href: "https://youtube.com/@picarevietnam",
      ariaLabel: "Truy cập YouTube Picare",
      brandColor: "#FF0000",
    },
  ];

  const legalLinks = [
    { label: "Cookies", href: "#" },
    { label: "Bản quyền", href: "#" },
    { label: "Quyền riêng tư", href: "#" },
  ];

  return (
    <footer
      className={`font-haffer relative w-full overflow-hidden border-t border-white/10 bg-[#0B0910] text-neutral-300 ${className}`}
    >
      {/* Background ambient lighting effects */}
      <div className="pointer-events-none absolute top-0 left-1/4 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-[#FFA336]/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-0 -z-10 h-96 w-96 translate-y-1/3 rounded-full bg-[#8B5CF6]/5 blur-[140px]" />

      {/* Main navigation container with padding structure matching the navbar */}
      <div className="w-full px-3 sm:px-6">
        <div className="flex w-full flex-col justify-between gap-12 px-6 pt-14 pb-12 sm:px-8 sm:pt-16 sm:pb-14 lg:flex-row lg:items-start lg:gap-16 lg:px-10 lg:pt-18 lg:pb-16">
          {/* Bên trái: Logo, Mô tả, 2 nút GSAP Đăng nhập & Bắt đầu, Socials */}
          <div className="flex max-w-md flex-col items-start">
            {/* Logo chính thức */}
            <Link
              to={PATHS.HOME}
              aria-label="Picare Client"
              className="-my-3 -ml-2 inline-flex cursor-pointer items-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:-my-4"
            >
              <img
                src={logoPicareNewBlack}
                alt="Picare Client"
                className="h-10 w-auto object-contain mix-blend-screen sm:h-12"
              />
            </Link>

            <p className="mt-4 text-xs leading-relaxed font-light text-neutral-400 sm:text-[13.5px]">
              Hệ sinh thái công nghệ quản lý vận hành bán hàng đa kênh & tối ưu
              hóa chuỗi cung ứng thông minh cho doanh nghiệp.
            </p>

            {/* 2 nút Đăng nhập & Bắt đầu với hiệu ứng GSAP physics (Đăng nhập dạng text link có underline, Bắt đầu dạng viên thuốc) */}
            <div className="mt-6 flex items-center gap-5">
              <GsapFooterLoginButton onClick={handleLoginClick} />
              <GsapFooterStartButton onClick={handleStartClick} />
            </div>

            {/* Social Media Buttons & Email */}
            <div className="mt-8">
              <span className="text-[11px] font-medium text-neutral-500 uppercase">
                Theo dõi chúng tôi
              </span>
              <div className="mt-2.5 flex items-center gap-2.5">
                {socialLinks.map((social) => (
                  <GsapSocialButton key={social.name} social={social} />
                ))}
              </div>

              {/* Dòng email hỗ trợ rainbow */}
              <div className="mt-3.5 flex items-center gap-1.5">
                <span className="text-[11.5px] font-normal text-neutral-500">
                  Email:
                </span>
                <RainbowEmailLink />
              </div>
            </div>
          </div>

          {/* Bên phải: Các danh sách list footer dàn đều justify-between */}
          <div className="flex w-full flex-wrap justify-between gap-10 sm:gap-14 lg:w-auto lg:gap-16 xl:gap-24">
            {/* 1. Sản phẩm */}
            <div className="flex min-w-[140px] flex-col">
              <h3 className="text-xs font-semibold text-white uppercase">
                Sản phẩm
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs sm:text-[13.5px]">
                {productLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href || "#"}
                      className="group inline-flex items-center gap-2 text-neutral-400 transition-colors duration-200 hover:text-white"
                    >
                      <span className="nav-link-underline">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-neutral-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Picare Vietnam */}
            <div className="flex min-w-[130px] flex-col">
              <h3 className="text-xs font-semibold text-white uppercase">
                Về chúng tôi
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs sm:text-[13.5px]">
                {companyLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href || "#"}
                      className="group inline-flex items-center gap-1 text-neutral-400 transition-colors duration-200 hover:text-white"
                    >
                      <span className="nav-link-underline">{item.label}</span>
                      {item.isExternal && (
                        <FiArrowUpRight className="h-3 w-3" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Liên hệ */}
            <div className="flex min-w-[130px] flex-col">
              <h3 className="text-xs font-semibold text-white uppercase">
                Liên hệ
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs sm:text-[13.5px]">
                {contactLinks.map((item) => (
                  <li key={item.label}>
                    {item.onClick ? (
                      <button
                        type="button"
                        onClick={item.onClick}
                        className="group cursor-pointer text-neutral-400 transition-colors duration-200 hover:text-white"
                      >
                        <span className="nav-link-underline">{item.label}</span>
                      </button>
                    ) : (
                      <Link
                        to={item.href || "#"}
                        className="group text-neutral-400 transition-colors duration-200 hover:text-white"
                      >
                        <span className="nav-link-underline">{item.label}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright nằm ở giữa, Legal Links bên trái, Creator bên phải */}
      <div className="border-t border-white/[0.06] bg-black/40">
        <div className="w-full px-3 sm:px-6">
          <div className="grid w-full grid-cols-1 items-center gap-4 px-6 py-5 sm:grid-cols-3 sm:px-8 lg:px-10">
            {/* Legal Links (Bên trái) */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px] text-neutral-400 sm:justify-start sm:text-xs">
              {legalLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group transition-colors duration-200 hover:text-white"
                >
                  <span className="nav-link-underline">{item.label}</span>
                </a>
              ))}
            </div>

            {/* Copyright nằm chính giữa */}
            <div className="text-center text-[11.5px] text-neutral-500 sm:text-xs">
              © {new Date().getFullYear()} Picare Vietnam. Tất cả quyền được bảo
              lưu.
            </div>

            {/* Creator Attribution: TriTruong666 (Bên phải) */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 sm:justify-end sm:text-xs">
              <span>Thiết kế & phát triển bởi</span>
              <span className="font-medium text-neutral-300">TriTruong666</span>
              <FiHeart className="h-3 w-3 text-red-400/80" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicLandingFooter;
