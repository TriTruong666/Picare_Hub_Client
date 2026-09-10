import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiGrid,
  FiX,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";
import gsap from "gsap";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import loginMockup from "@/assets/images/login_mockup.jpeg";
import { useLogin } from "@/hooks/data/useAuthHooks";
import { getApiErrorMessage } from "@/common/api.error";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/config/paths";
import { canAccessDashboard } from "@/config/dashboardAccess";
import { useHubClients, useHubClientDetail, useCheckAccessHubClient } from "@/hooks/data/useHubClientHooks";
import { checkAccessHubClient } from "@/apis/hub_client.service";
import { useCurveTransition } from "@/components/custom_ui/CurvePageTransition";
import {
  DIGITAL_CATALOGUE_CLIENT_ID,
  DIGITAL_CONTRACT_CLIENT_ID,
  QR_CODE_GENERATOR_CLIENT_ID,
  STATIC_HUB_CLIENTS,
} from "@/constants/staticHubClients";
import type { HubClient } from "@/types/HubClient";
import type { User } from "@/types/User";
import { PublicLandingNavbar } from "@/components/landing/PublicLandingNavbar";

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return PATHS.HOME;
  }

  if (value.startsWith(PATHS.LOGIN)) {
    return PATHS.HOME;
  }

  return value;
}

interface LoginHubFormSectionProps {
  onBack?: () => void;
  backTo?: string;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.08,
      ease: [0.25, 1, 0.5, 1],
    },
  }),
};

// ─── Subcomponent: ClientCard (Y chang UI cũ của LoginClientPage) ─────────────
// ─── Subcomponent: ClientCard (Font Haffer, Animation và Style gần giống LandingPageTest) ───
function ClientCard({ client, index }: { client: HubClient; index: number }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { navigateWithTransition } = useCurveTransition();
  const preferredMockup = client.clientMockupImage?.trim() || loginMockup;
  const [mockupSrc, setMockupSrc] = useState(preferredMockup);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isActive = client.clientStatus === "active";

  const bgRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const isStatic =
    client.clientId === DIGITAL_CONTRACT_CLIENT_ID ||
    client.clientId === QR_CODE_GENERATOR_CLIENT_ID ||
    client.clientId === DIGITAL_CATALOGUE_CLIENT_ID;

  const handleAccess = () => {
    if (!isActive) {
      return;
    }

    // 1. Static Client: Dùng CurvePageTransition để tự chuyển trang nếu đã đăng nhập; nếu chưa đăng nhập -> về /login?redirect=...
    if (isStatic) {
      const internalUrl = client.clientInternalUrl || PATHS.CONTRACT_CREATE;
      if (!isAuthenticated) {
        navigate(`${PATHS.LOGIN}?redirect=${encodeURIComponent(internalUrl)}`);
        return;
      }
      navigateWithTransition(internalUrl, {
        text: client.clientName,
      });
      return;
    }

    // 2. API Client (Server): /login/client KHÔNG tự redirect tới trang ngoài
    // Luôn redirect về /login?clientId=... để trang /login tự kiểm tra quyền và điều hướng
    navigate(`${PATHS.LOGIN}?clientId=${client.clientId}`);
  };

  const handleMouseEnter = () => {
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        opacity: 1,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (imgRef.current) {
      gsap.to(imgRef.current, {
        scale: 1.05,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        backgroundColor: "#FFA336",
        borderColor: "#FFA336",
        color: "#000000",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  const handleMouseLeave = () => {
    if (bgRef.current) {
      gsap.to(bgRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (imgRef.current) {
      gsap.to(imgRef.current, {
        scale: 1,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        color: "#ffffff",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      onClick={handleAccess}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="client-card-item group relative flex min-h-[360px] sm:min-h-[44vh] lg:min-h-0 lg:h-full w-full cursor-pointer flex-col justify-between overflow-hidden border-r border-b border-white/[0.08] bg-[#070709] select-none"
    >
      {/* Subtle Warm Apricot/Amber Glow Layer giống LandingPageTest */}
      <div
        ref={bgRef}
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-[#FFA336]/12 via-[#F86D2B]/5 to-transparent transition-opacity"
        style={{ opacity: 0 }}
      />

      {/* Mockup Image Area */}
      <div className="relative flex-1 w-full overflow-hidden bg-[#0a0a0e]">
        <img
          ref={imgRef}
          src={mockupSrc}
          alt={client.clientName}
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-cover object-center grayscale transition-[filter,transform,opacity] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-90 group-hover:grayscale-0 ${
            imageLoaded ? "opacity-60" : "opacity-0"
          }`}
          onError={() => {
            setMockupSrc(loginMockup);
            setImageLoaded(true);
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-black/20" />
      </div>

      {/* Bottom Content Area: Title, Description & Circular CTA (Bỏ role, phẳng hoàn toàn) */}
      <div className="pointer-events-none relative z-10 flex w-full items-end justify-between p-5 sm:p-6 lg:p-7 border-t border-white/[0.06] bg-[#070709]">
        <div className="pointer-events-auto flex max-w-[calc(100%-3.5rem)] flex-col text-left">
          <h3 className="font-haffer text-lg font-medium tracking-tight text-white sm:text-xl lg:text-[22px] transition-colors group-hover:text-white">
            {client.clientName}
          </h3>
          {client.clientDescription && (
            <p className="font-haffer mt-1 line-clamp-2 text-xs font-light text-white/60 sm:text-[13px] leading-relaxed transition-colors group-hover:text-white/80">
              {client.clientDescription}
            </p>
          )}
        </div>

        {/* Circular Action Button y chang LandingPageTest */}
        <button
          ref={btnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleAccess();
          }}
          disabled={!isActive}
          className="pointer-events-auto flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-lg backdrop-blur-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={`Truy cập ${client.clientName}`}
        >
          <FiArrowRight
            size={17}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Subcomponent: Skeleton Loading Card ──────────────────────────────────────
function ClientSkeleton() {
  return (
    <div className="relative flex min-h-[360px] sm:min-h-[44vh] lg:min-h-0 lg:h-full flex-col justify-between border-r border-b border-white/[0.08] bg-[#070709]">
      <div className="flex-1 w-full animate-pulse bg-white/3" />
      <div className="flex flex-col space-y-2 p-5 sm:p-6 lg:p-7 border-t border-white/[0.06]">
        <div className="h-6 w-36 animate-pulse rounded-full bg-white/5" />
        <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-white/3" />
      </div>
    </div>
  );
}

// ─── Subcomponent: Empty Placeholder ──────────────────────────────────────────
function EmptyCard() {
  return (
    <div className="relative flex min-h-[360px] sm:min-h-[44vh] lg:min-h-0 lg:h-full border-r border-b border-white/[0.08] bg-transparent" />
  );
}

// ─── Main Component: LoginHubFormSection ───────────────────────────────────────
export default function LoginHubFormSection({
  onBack,
  backTo = PATHS.HOME,
}: LoginHubFormSectionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  const clientId = searchParams.get("clientId");
  const { data: clientDetail } = useHubClientDetail(clientId || "");
  const {
    fullResponse: accessResponse,
    error: accessError,
  } = useCheckAccessHubClient(isAuthenticated && clientId ? clientId : "");

  const axiosError = accessError as any;
  const errorCode =
    accessResponse?.error_code || axiosError?.response?.data?.error_code;
  const status = axiosError?.response?.status;

  const hasAccess = accessResponse?.success === true;
  const isAccessDenied =
    !hasAccess &&
    (errorCode === "ERR_AUTH_003" ||
      status === 403 ||
      (accessResponse && accessResponse.success === false));

  const [showLoginForm, setShowLoginForm] = useState(false);

  // Xác định trạng thái chọn Client: Nếu có clientId thì luôn hiển thị 50% form SSO login cho client đó
  const isClientSelectRoute =
    location.pathname.startsWith(PATHS.LOGIN_CLIENT) && !clientId;

  // Refs điều khiển Animation GSAP
  const panelRef = useRef<HTMLDivElement>(null);
  const formWrapperRef = useRef<HTMLDivElement>(null);
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const navbarWrapperRef = useRef<HTMLDivElement>(null);

  // Giữ lại trạng thái ban đầu khi mount để JSX không tự ý snap style đè lên GSAP
  const initialIsClientRef = useRef(
    location.pathname.startsWith(PATHS.LOGIN_CLIENT) && !clientId,
  );
  const prevIsClientRef = useRef(isClientSelectRoute);
  const isFirstRender = useRef(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [showProjects, setShowProjects] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginMutation = useLogin();
  const queryClient = useQueryClient();
  const redirectParam = searchParams.get("redirect");
  const redirectPath = getSafeRedirectPath(redirectParam);
  const isDashboardRedirect = redirectPath.startsWith(PATHS.DASHBOARD.ROOT);

  const projects = [
    { name: "Picare CRM", desc: "Quản lý khách hàng chuyên sâu" },
    { name: "Picare OMS", desc: "Hệ thống vận hành đơn hàng" },
    { name: "Picare Hub", desc: "Trung tâm quản trị tập trung" },
    { name: "Picare Analytics", desc: "Phân tích dữ liệu kinh doanh" },
  ];

  // Fetch danh sách clients cho giao diện grid
  const { data: clients, isLoading: isClientsLoading } = useHubClients({
    limit: 100,
    status: "active",
  });

  const clientList = [...(clients || []), ...STATIC_HUB_CLIENTS];

  // ─── Responsive Resize Listener (chỉ co giãn khi ở form 50%) ────────────────
  useEffect(() => {
    const handleResize = () => {
      if (!panelRef.current) return;
      if (!isClientSelectRoute) {
        panelRef.current.style.width =
          window.innerWidth >= 768 ? "50%" : "100%";
      } else {
        panelRef.current.style.width = "100%";
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isClientSelectRoute]);

  // ─── GSAP 50% -> 100% Width Expansion Animation Controller ──────────────────
  useEffect(() => {
    if (!panelRef.current) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      const isDesktop = window.innerWidth >= 768;
      if (isClientSelectRoute) {
        // Cho /login/client: Di chuyển từ trong trái sang phải (xPercent: -100 -> 0)
        panelRef.current.style.width = "100%";
        panelRef.current.style.backgroundColor = "#050505";
        panelRef.current.style.borderColor = "transparent";
        gsap.fromTo(
          panelRef.current,
          { xPercent: -100, opacity: 0 },
          {
            xPercent: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
          },
        );
      } else {
        // Cho /login: Cho sẵn 50% nhưng trượt từ bên trong (trái) sang phải ra đúng vị trí (xPercent: -100 -> 0)
        panelRef.current.style.width = isDesktop ? "50%" : "100%";
        gsap.fromTo(
          panelRef.current,
          { xPercent: -100, opacity: 0 },
          {
            xPercent: 0,
            opacity: 1,
            duration: 1.15,
            ease: "power3.out",
          },
        );
      }
      return;
    }

    if (prevIsClientRef.current === isClientSelectRoute) {
      return;
    }
    prevIsClientRef.current = isClientSelectRoute;

    // Chuyển cảnh từ /login sang /login/client: Mở rộng 50% -> 100% kèm animation trượt từ trái sang phải
    if (isClientSelectRoute) {
      const tl = gsap.timeline();

      // 1. Form đăng nhập trượt nhẹ sang trái và mờ dần nhanh gọn, không chèn ép layout
      if (formWrapperRef.current) {
        tl.to(
          formWrapperRef.current,
          {
            x: -35,
            opacity: 0,
            duration: 0.28,
            ease: "power2.in",
            onComplete: () => {
              if (formWrapperRef.current) {
                formWrapperRef.current.style.display = "none";
                gsap.set(formWrapperRef.current, { x: 0 });
              }
            },
          },
          0,
        );
      }

      // 2. Mở rộng Panel từ 50% sang 100% mượt mà bằng GSAP (không nhảy giật)
      tl.to(
        panelRef.current,
        {
          width: "100%",
          backgroundColor: "#050505",
          borderColor: "transparent",
          duration: 0.65,
          ease: "power3.inOut",
        },
        0,
      );

      // 3. Grid chọn Client (absolute layer) trượt êm ái từ trái sang phải
      if (gridWrapperRef.current) {
        gridWrapperRef.current.style.display = "block";
        tl.fromTo(
          gridWrapperRef.current,
          { xPercent: -100, opacity: 0 },
          { xPercent: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
          0.08,
        );

        tl.fromTo(
          ".client-card-item",
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.05,
            ease: "power2.out",
          },
          0.25,
        );
      }

      // 4. Hiện Navbar phía trên
      if (navbarWrapperRef.current) {
        navbarWrapperRef.current.style.display = "block";
        tl.fromTo(
          navbarWrapperRef.current,
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
          0.2,
        );
      }
    } else {
      // Thu gọn từ 100% về 50% khi quay về /login
      const tl = gsap.timeline();

      // 1. Grid và Navbar mờ dần và trượt nhẹ
      if (navbarWrapperRef.current) {
        tl.to(
          navbarWrapperRef.current,
          {
            opacity: 0,
            y: -16,
            duration: 0.25,
            ease: "power2.inOut",
            onComplete: () => {
              if (navbarWrapperRef.current)
                navbarWrapperRef.current.style.display = "none";
            },
          },
          0,
        );
      }

      if (gridWrapperRef.current) {
        tl.to(
          gridWrapperRef.current,
          {
            xPercent: -100,
            opacity: 0,
            duration: 0.45,
            ease: "power3.in",
            onComplete: () => {
              if (gridWrapperRef.current) {
                gridWrapperRef.current.style.display = "none";
                gsap.set(gridWrapperRef.current, { xPercent: 0 });
              }
            },
          },
          0,
        );
      }

      // 2. Thu gọn Panel từ 100% về 50%
      const isDesktop = window.innerWidth >= 768;
      const targetWidth = isDesktop ? "50%" : "100%";
      tl.to(
        panelRef.current,
        {
          width: targetWidth,
          backgroundColor: "rgba(0, 0, 0, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.08)",
          duration: 0.65,
          ease: "power3.inOut",
        },
        0.1,
      );

      // 3. Hiển thị form đăng nhập và các trường trượt nhẹ vào vị trí
      if (formWrapperRef.current) {
        formWrapperRef.current.style.display = "flex";
        tl.fromTo(
          formWrapperRef.current,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.45, ease: "power2.out" },
          0.25,
        );

        const subElements = formWrapperRef.current.querySelectorAll(
          ".form-anim-header, .form-anim-title, .form-anim-field, .form-anim-btn, .form-anim-footer",
        );
        tl.fromTo(
          subElements,
          {
            opacity: 0,
            y: 18,
            scale: 0.98,
            filter: "blur(5px)",
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.48,
            stagger: 0.05,
            ease: "power2.out",
          },
          "-=0.3",
        );
      }
    }
  }, [isClientSelectRoute]);

  // ─── Form Submission Handler ────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setFormError("");

    let hasError = false;
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setEmailError("Vui lòng nhập địa chỉ email.");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Địa chỉ email không đúng định dạng.");
      hasError = true;
    }

    if (!trimmedPassword) {
      setPasswordError("Vui lòng nhập mật khẩu.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsSubmitting(true);
    loginMutation.mutate(
      { email: trimmedEmail, password: trimmedPassword },
      {
        onSuccess: async (res) => {
          if (res.success) {
            await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
            const currentUser = queryClient.getQueryData<User>(["auth", "me"]);

            // Nếu đang đăng nhập SSO cho 1 client cụ thể (API Client)
            if (clientId && clientDetail) {
              try {
                const accessRes = await checkAccessHubClient(clientId);
                if (accessRes.success) {
                  if (clientDetail.clientExternalUrl) {
                    window.location.href = clientDetail.clientExternalUrl;
                    return;
                  }
                }

                queryClient.setQueryData(
                  ["hub-clients-access", clientId],
                  accessRes,
                );
                await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
                setFormError("Tài khoản không có quyền truy cập hệ thống này.");
                setShowLoginForm(false);
                setIsSubmitting(false);
                return;
              } catch (err: any) {
                const errCode = err.response?.data?.error_code;
                queryClient.setQueryData(["hub-clients-access", clientId], {
                  success: false,
                  error_code: errCode || "ERR_UNKNOWN",
                });
                await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
                setFormError("Tài khoản không có quyền truy cập hệ thống này.");
                setShowLoginForm(false);
                setIsSubmitting(false);
                return;
              }
            }

            // Đăng nhập Hub chung
            if (
              isDashboardRedirect &&
              !canAccessDashboard(currentUser?.role)
            ) {
              setFormError("Tài khoản không có quyền truy cập dashboard.");
              setIsSubmitting(false);
              return;
            }

            const targetUrl =
              redirectParam &&
              redirectPath !== PATHS.HOME &&
              redirectPath !== PATHS.LOGIN &&
              redirectPath !== PATHS.LOGIN_CLIENT
                ? redirectPath
                : PATHS.LOGIN_CLIENT;

            // Điều hướng sang /login/client, kích hoạt GSAP mở rộng 100%
            navigate(targetUrl);
          }
          setIsSubmitting(false);
        },
        onError: (err: any) => {
          setFormError(
            getApiErrorMessage(err) || "Email hoặc mật khẩu không chính xác.",
          );
          setIsSubmitting(false);
        },
      },
    );
  };

  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (clientId) {
      navigate(PATHS.LOGIN_CLIENT);
      return;
    }
    if (panelRef.current) {
      if (isClientSelectRoute) {
        // Từ /login/client về /: Co width từ 100% về 0%
        const tl = gsap.timeline({
          onComplete: () => {
            if (onBack) onBack();
            else navigate(backTo);
          },
        });
        if (navbarWrapperRef.current) {
          tl.to(
            navbarWrapperRef.current,
            { opacity: 0, y: -15, duration: 0.25 },
            0,
          );
        }
        if (gridWrapperRef.current) {
          tl.to(gridWrapperRef.current, { opacity: 0, duration: 0.25 }, 0);
        }
        tl.to(
          panelRef.current,
          { width: "0%", duration: 0.85, ease: "power3.inOut" },
          "-=0.1",
        );
      } else {
        // Từ /login về /: Trượt panel 50% quay trở lại bên trong (trái): xPercent: 0 -> -100
        gsap.to(panelRef.current, {
          xPercent: -100,
          opacity: 0,
          duration: 0.85,
          ease: "power3.inOut",
          onComplete: () => {
            if (onBack) onBack();
            else navigate(backTo);
          },
        });
      }
    } else {
      if (onBack) onBack();
      else navigate(backTo);
    }
  };

  return (
    <div className="font-haffer relative min-h-screen min-h-dvh w-full overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-transparent">
      {/* ─── Navbar: Fixed ở trên cùng khi ở /login/client đè lên không có bg ─── */}
      <div
        ref={navbarWrapperRef}
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
        style={{
          display: initialIsClientRef.current ? "block" : "none",
          opacity: initialIsClientRef.current ? 1 : 0,
        }}
      >
        <PublicLandingNavbar
          isDarkBg={false}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogoClick={handleBack}
          className="z-50"
        />
      </div>

      {/* ─── Panel Container: 50% khi ở /login, GSAP mở rộng 100% sang /login/client ─── */}
      <div
        ref={panelRef}
        className="relative z-10 flex min-h-screen flex-col overflow-x-hidden overflow-y-auto lg:overflow-hidden will-change-[width,transform,background-color] border-r shadow-2xl backdrop-blur-md"
        style={{
          width: initialIsClientRef.current
            ? "100%"
            : typeof window !== "undefined" && window.innerWidth >= 768
              ? "50%"
              : "100%",
          backgroundColor: initialIsClientRef.current
            ? "#050505"
            : "rgba(0, 0, 0, 0.95)",
          borderColor: initialIsClientRef.current
            ? "transparent"
            : "rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* ─── GIAO DIỆN 1: FORM ĐĂNG NHẬP 50% UI GỐC ĐẦY ĐỦ ─── */}
        <div
          ref={formWrapperRef}
          style={{
            display: initialIsClientRef.current ? "none" : "flex",
            opacity: initialIsClientRef.current ? 0 : 1,
          }}
          className="flex min-h-screen w-full flex-1 flex-col justify-between px-8 py-8 md:px-14 lg:px-20"
        >
          {/* Header Bar: Logo & Back Link */}
          <div className="form-anim-header flex items-center justify-between will-change-[transform,opacity,filter]">
            <a
              href="/"
              onClick={handleBack}
              className="group flex items-center cursor-pointer"
            >
              <img
                src={logoPicareNewBlack}
                alt="Picare Client"
                className="-my-2 h-7 w-auto object-contain mix-blend-screen transition-opacity hover:opacity-85 sm:h-9 md:h-10"
              />
            </a>

            <button
              type="button"
              onClick={handleBack}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
            >
              <FiArrowLeft className="text-xs" />
              <span>Quay lại</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="flex flex-1 flex-col justify-center py-10">
            <div className="mx-auto w-full max-w-130">
              {/* Title & Auth Status - Picare Client. hoặc Tên Client */}
              <div className="form-anim-title mb-10 will-change-[transform,opacity,filter]">
                <h1 className="font-haffer text-3xl font-light tracking-[-0.04em] text-white sm:text-4xl">
                  {clientId && clientDetail?.clientName ? (
                    <span className="font-normal text-white/90">
                      {clientDetail.clientName}
                      <span className="text-[#FFA336]">.</span>
                    </span>
                  ) : (
                    <>
                      <span className="italic font-light">Picare</span>{" "}
                      <span className="font-normal text-white/90">
                        Client<span className="text-[#FFA336]">.</span>
                      </span>
                    </>
                  )}
                </h1>

                {/* Subtitle & Role Guard Messages */}
                {clientId && isAuthenticated && user && !showLoginForm ? (
                  <div className="mt-3 space-y-2">
                    <p className="font-haffer text-[13px] font-normal text-zinc-300">
                      Đang đăng nhập với tài khoản:{" "}
                      <span className="font-medium text-white">{user.name}</span>
                    </p>
                    {isAccessDenied && (
                      <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 text-left">
                        <p className="text-[12.5px] font-semibold text-red-400">
                          Truy cập bị từ chối
                        </p>
                        <p className="mt-0.5 text-[11.5px] font-light leading-relaxed text-zinc-300">
                          Tài khoản của bạn không có quyền truy cập vào hệ thống này.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-haffer mt-2.5 text-[13px] font-light leading-relaxed text-zinc-400">
                    {clientId && clientDetail?.clientName
                      ? `Vui lòng đăng nhập để vào hệ thống ${clientDetail.clientName}`
                      : "Đăng nhập không gian làm việc và hệ thống quản trị nội bộ tập trung"}
                  </p>
                )}
              </div>

              {/* Nếu có clientId, đã đăng nhập và chưa bấm đổi tài khoản */}
              {clientId && isAuthenticated && user && !showLoginForm ? (
                <div className="space-y-4">
                  {hasAccess && (
                    <motion.button
                      type="button"
                      onClick={() => {
                        if (clientDetail?.clientExternalUrl) {
                          window.location.href = clientDetail.clientExternalUrl;
                        }
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-white py-3.5 text-sm font-semibold tracking-wide text-zinc-950 shadow-[0_4px_24px_rgba(255,255,255,0.2)] transition-all hover:bg-zinc-100 active:scale-[0.98]"
                    >
                      <span>Đi tới {clientDetail?.clientName || "hệ thống"}</span>
                      <FiArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-1" />
                    </motion.button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowLoginForm(true)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-3 text-xs font-medium text-zinc-300 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  >
                    Đăng nhập bằng tài khoản khác
                  </button>
                </div>
              ) : (
                /* Login Form */
                <form noValidate onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="form-anim-field space-y-1.5 will-change-[transform,opacity,filter]">
                    <label className="text-xs font-medium tracking-wide text-zinc-400">
                      Email
                    </label>
                    <div className="group relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError("");
                          if (formError) setFormError("");
                        }}
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        placeholder="name@company.com"
                        className="w-full bg-transparent py-3 text-sm text-white placeholder-zinc-600 transition-all outline-none"
                      />
                      <div className="absolute bottom-0 h-px w-full bg-white/10" />
                      <motion.div
                        className="absolute bottom-0 h-px w-full origin-left bg-linear-to-r from-[#F86D2B] to-[#FFA336]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isEmailFocused ? 1 : 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    {emailError && (
                      <p className="text-[11px] font-normal text-rose-400">
                        {emailError}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="form-anim-field space-y-1.5 will-change-[transform,opacity,filter]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium tracking-wide text-zinc-400">
                        Mật khẩu
                      </label>
                      <Link
                        to="#"
                        className="text-xs text-zinc-400 transition-colors hover:text-zinc-200"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>
                    <div className="group relative">
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (passwordError) setPasswordError("");
                            if (formError) setFormError("");
                          }}
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => setIsPasswordFocused(false)}
                          placeholder="••••••••"
                          className="w-full bg-transparent py-3 pr-10 text-sm text-white placeholder-zinc-600 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 cursor-pointer text-zinc-500 transition-colors hover:text-zinc-300"
                          aria-label={
                            showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                          }
                        >
                          {showPassword ? (
                            <FiEyeOff size={16} />
                          ) : (
                            <FiEye size={16} />
                          )}
                        </button>
                      </div>
                      <div className="absolute bottom-0 h-px w-full bg-white/10" />
                      <motion.div
                        className="absolute bottom-0 h-px w-full origin-left bg-linear-to-r from-[#F86D2B] to-[#FFA336]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isPasswordFocused ? 1 : 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    {passwordError && (
                      <p className="text-[11px] font-normal text-rose-400">
                        {passwordError}
                      </p>
                    )}
                  </div>

                  {/* Inline Error */}
                  {(formError || loginMutation.isError) && (
                    <p className="pt-1 text-[11px] font-normal text-rose-400">
                      * {formError || getApiErrorMessage(loginMutation.error)}
                    </p>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="form-anim-btn will-change-[transform,opacity,filter] group relative mt-8 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-white py-3.5 text-sm font-semibold tracking-wide text-zinc-950 shadow-[0_4px_24px_rgba(255,255,255,0.15)] transition-all duration-200 hover:bg-zinc-100 hover:shadow-[0_6px_30px_rgba(255,255,255,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>
                      {isSubmitting ? "Đang xác thực..." : "Đăng nhập hệ thống"}
                    </span>
                    <FiArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-1" />
                  </motion.button>

                  {/* Nút quay lại tài khoản hiện tại nếu đang đổi tài khoản */}
                  {clientId && isAuthenticated && showLoginForm && (
                    <button
                      type="button"
                      onClick={() => setShowLoginForm(false)}
                      className="mt-2 text-center w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Sử dụng lại tài khoản hiện tại ({user?.name})
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="form-anim-footer py-4 will-change-[opacity]">
            <p className="text-center font-light text-[11px] text-zinc-600">
              Copyright © {new Date().getFullYear()} Picare Client. All rights
              reserved.
            </p>
          </div>
        </div>

        {/* ─── GIAO DIỆN 2: CHỌN CLIENT (Full screen full height 6 items edge-to-edge tại /login/client) ─── */}
        <div
          ref={gridWrapperRef}
          className="absolute inset-0 z-20 min-h-screen w-full bg-[#050505] overflow-x-hidden overflow-y-auto lg:h-screen lg:overflow-hidden"
          style={{
            display: initialIsClientRef.current ? "block" : "none",
            opacity: initialIsClientRef.current ? 1 : 0,
          }}
        >
          {/* Outer border frame */}
          <div className="pointer-events-none absolute inset-0 border border-white/[0.08]" />

          {/* Grid 6 items: 3 cột x 2 hàng = full height screen 100vh trên desktop, scroll được trên mobile */}
          <div className="grid h-auto min-h-full w-full grid-cols-1 border-t border-l border-white/[0.08] pt-24 pb-14 sm:pt-28 md:grid-cols-2 lg:h-full lg:p-0 lg:grid-cols-3 lg:grid-rows-2">
            {isClientsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ClientSkeleton key={i} />
              ))
            ) : (
              <>
                {clientList.slice(0, 6).map((client, i) => (
                  <ClientCard
                    key={client.clientId}
                    client={client}
                    index={i}
                  />
                ))}
                {Array.from({
                  length: Math.max(0, 6 - Math.min(6, clientList.length)),
                }).map((_, i) => (
                  <EmptyCard key={`empty-${i}`} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button (Dự án trong hệ sinh thái) khi ở chế độ 50% form */}
      {!isClientSelectRoute && (
        <div className="fixed right-6 bottom-6 z-50">
          <AnimatePresence>
            {showProjects && (
              <div className="absolute right-0 bottom-16 mb-2 flex flex-col items-end gap-2">
                {projects.map((project, idx) => (
                  <motion.button
                    key={project.name}
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      y: 8,
                      scale: 0.95,
                      transition: {
                        delay: (projects.length - 1 - idx) * 0.03,
                        duration: 0.15,
                      },
                    }}
                    transition={{
                      delay: idx * 0.05,
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex w-52 cursor-pointer flex-col items-start gap-0.5 rounded-xl border border-white/10 bg-zinc-900/95 px-4 py-2.5 text-left shadow-2xl backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-zinc-800"
                  >
                    <span className="text-xs font-medium text-white">
                      {project.name}
                    </span>
                    <span className="font-light text-[10px] text-zinc-400">
                      {project.desc}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowProjects(!showProjects)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-zinc-900 text-zinc-300 shadow-2xl transition-all hover:text-white"
          >
            {showProjects ? <FiX size={18} /> : <FiGrid size={18} />}
          </motion.button>
        </div>
      )}
    </div>
  );
}
