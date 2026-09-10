import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEyeOff,
  FiGrid,
  FiX,
  FiArrowRight,
  FiArrowUpRight,
  FiArrowLeft,
} from "react-icons/fi";
import gsap from "gsap";
import logoPicareNewBlack from "@/assets/images/logo_picare_new_black.png";
import loginMockup from "@/assets/images/login_mockup.jpeg";
import { useLogin } from "@/hooks/data/useAuthHooks";
import { getApiErrorMessage } from "@/common/api.error";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/config/paths";
import { toast } from "@/hooks/useToast";
import { canAccessDashboard } from "@/config/dashboardAccess";
import { useHubClients } from "@/hooks/data/useHubClientHooks";
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
function ClientCard({ client, index }: { client: HubClient; index: number }) {
  const navigate = useNavigate();
  const preferredMockup = client.clientMockupImage?.trim() || loginMockup;
  const [mockupSrc, setMockupSrc] = useState(preferredMockup);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isActive = client.clientStatus === "active";

  const handleAccess = () => {
    if (!isActive) {
      return;
    }

    if (
      client.clientId === DIGITAL_CONTRACT_CLIENT_ID ||
      client.clientId === QR_CODE_GENERATOR_CLIENT_ID ||
      client.clientId === DIGITAL_CATALOGUE_CLIENT_ID
    ) {
      navigate(client.clientInternalUrl || PATHS.CONTRACT_CREATE);
      return;
    }

    navigate(`${PATHS.LOGIN_CLIENT}?clientId=${client.clientId}`);
  };

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="client-card-item group relative flex flex-col border-r border-b border-white/[0.07] bg-[#050505]"
    >
      <div className="flex flex-1 flex-col p-0">
        {/* Mockup Image Header */}
        <div className="relative aspect-video w-full overflow-hidden border-b border-white/[0.07] bg-[#0a0a0c]">
          <img
            src={mockupSrc}
            alt={client.clientName}
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover grayscale transition-[filter,transform,opacity] duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03] group-hover:opacity-100 group-hover:grayscale-0 ${
              imageLoaded ? "opacity-60" : "opacity-0"
            }`}
            onError={() => {
              setMockupSrc(loginMockup);
              setImageLoaded(true);
            }}
          />
        </div>

        <div className="flex flex-1 flex-col px-6 py-6">
          {/* Title */}
          <h2 className="font-bricolage mb-2.5 text-[15px] font-semibold tracking-tight text-white/80">
            {client.clientName}
          </h2>

          {/* Description */}
          <p className="font-inter flex-1 text-[13px] leading-relaxed text-white/30">
            {client.clientDescription}
          </p>

          {/* Bottom */}
          <div className="mt-6 flex items-center justify-between">
            {/* Roles */}
            <div className="flex flex-wrap gap-1.5">
              {client.allowedRoles.slice(0, 2).map((role) => (
                <span
                  key={role}
                  className="font-inter border border-white/6 px-2 py-0.5 text-[10px] tracking-wider text-white/20 uppercase"
                >
                  {role.replace("_", " ")}
                </span>
              ))}
              {client.allowedRoles.length > 2 && (
                <span className="font-inter border border-white/6 px-2 py-0.5 text-[10px] text-white/15">
                  +{client.allowedRoles.length - 2}
                </span>
              )}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleAccess}
              disabled={!isActive}
              className="group/btn font-inter flex cursor-pointer items-center gap-1.5 border border-white/10 px-3.5 py-1.5 text-[12px] text-white/35 transition-all duration-200 hover:border-[#a78bfa]/40 hover:text-[#a78bfa] disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-white/10 disabled:hover:text-white/35"
            >
              <span>Truy cập</span>
              <FiArrowUpRight
                size={13}
                className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Subcomponent: Skeleton Loading Card (Y chang UI cũ của LoginClientPage) ──
function ClientSkeleton() {
  return (
    <div className="relative flex flex-col border-r border-b border-white/[0.07] bg-[#050505]">
      <div className="aspect-video w-full animate-pulse border-b border-white/[0.07] bg-white/3" />
      <div className="flex flex-1 flex-col space-y-4 px-6 py-6">
        <div className="h-5 w-32 animate-pulse rounded-full bg-white/5" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-white/3" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/3" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-6">
          <div className="flex gap-2">
            <div className="h-5 w-14 animate-pulse border border-white/5 bg-white/1" />
            <div className="h-5 w-14 animate-pulse border border-white/5 bg-white/1" />
          </div>
          <div className="h-8 w-24 animate-pulse border border-white/5 bg-white/1" />
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponent: Empty Placeholder (Y chang UI cũ của LoginClientPage) ──────
function EmptyCard() {
  return (
    <div className="relative min-h-100 border-r border-b border-white/[0.07] bg-transparent" />
  );
}

// ─── Main Component: LoginHubFormSection ───────────────────────────────────────
export default function LoginHubFormSection({
  onBack,
  backTo = PATHS.HOME,
}: LoginHubFormSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();

  // Test switch: Cho phép kiểm tra chuyển cảnh tức thì khi không bật backend auth server
  const [testLoggedIn, setTestLoggedIn] = useState(false);
  const isEffectiveLoggedIn = isAuthenticated || testLoggedIn;
  const activeUser: User | null =
    user ||
    (testLoggedIn
      ? {
          userId: "test-admin-id",
          name: "Picare Admin",
          role: "admin",
          email: "admin@picare.vn",
          isOnline: true,
          createdAt: new Date().toISOString(),
        }
      : null);

  // Refs điều khiển Animation GSAP
  const panelRef = useRef<HTMLDivElement>(null);
  const formWrapperRef = useRef<HTMLDivElement>(null);
  const gridWrapperRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
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
  const minSlots = 6;
  const placeholders = Math.max(0, minSlots - clientList.length);

  // ─── GSAP Expansion & Transition Controller ──────────────────────────────────
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!panelRef.current) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (isEffectiveLoggedIn) {
        gsap.set(panelRef.current, { width: "100%" });
        if (formWrapperRef.current)
          gsap.set(formWrapperRef.current, { display: "none", opacity: 0 });
        if (gridWrapperRef.current)
          gsap.set(gridWrapperRef.current, { display: "block", opacity: 1 });
      } else {
        const isDesktop = window.innerWidth >= 768;
        gsap.set(panelRef.current, { width: isDesktop ? "50%" : "100%" });
        if (formWrapperRef.current)
          gsap.set(formWrapperRef.current, { display: "flex", opacity: 1 });
        if (gridWrapperRef.current)
          gsap.set(gridWrapperRef.current, { display: "none", opacity: 0 });
      }
      return;
    }

    if (isEffectiveLoggedIn) {
      // 50% -> 100%
      const tl = gsap.timeline();

      if (formWrapperRef.current) {
        tl.to(formWrapperRef.current, {
          opacity: 0,
          y: -15,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            if (formWrapperRef.current)
              formWrapperRef.current.style.display = "none";
          },
        });
      }

      tl.to(
        panelRef.current,
        {
          width: "100%",
          duration: 0.75,
          ease: "power3.inOut",
        },
        "-=0.1",
      );

      if (gridWrapperRef.current) {
        gridWrapperRef.current.style.display = "block";
        tl.fromTo(
          gridWrapperRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.35 },
          "-=0.25",
        );

        tl.fromTo(
          ".client-card-item",
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
          },
          "-=0.2",
        );
      }
    } else {
      // 100% -> 50%
      const tl = gsap.timeline();

      if (gridWrapperRef.current) {
        tl.to(gridWrapperRef.current, {
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            if (gridWrapperRef.current)
              gridWrapperRef.current.style.display = "none";
          },
        });
      }

      const isDesktop = window.innerWidth >= 768;
      tl.to(panelRef.current, {
        width: isDesktop ? "50%" : "100%",
        duration: 0.65,
        ease: "power3.inOut",
      });

      if (formWrapperRef.current) {
        formWrapperRef.current.style.display = "flex";
        tl.fromTo(
          formWrapperRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
          "-=0.2",
        );
      }
    }
  }, [isEffectiveLoggedIn]);

  // ─── Form Submission Handler ────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async (res) => {
          if (res.success) {
            toast.success(
              "Đăng nhập thành công",
              "Chào mừng quay trở lại Picare Client!",
            );
            await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
            const currentUser = queryClient.getQueryData<User>(["auth", "me"]);

            if (
              isDashboardRedirect &&
              !canAccessDashboard(currentUser?.role)
            ) {
              toast.error(
                "Truy cập bị từ chối",
                "Tài khoản không có quyền truy cập dashboard.",
              );
              window.location.href = PATHS.HOME;
              return;
            }

            if (
              redirectParam &&
              redirectPath !== PATHS.HOME &&
              redirectPath !== PATHS.LOGIN
            ) {
              window.location.href = redirectPath;
              return;
            }

            // Kích hoạt animation GSAP mở rộng 100% để hiển thị Grid chọn client
            setTestLoggedIn(true);
          }
          setIsSubmitting(false);
        },
        onError: () => setIsSubmitting(false),
      },
    );
  };

  return (
    <div className="font-haffer relative min-h-screen w-full overflow-hidden bg-transparent select-none">
      {/* ─── Dev Mode Test Switch ─── */}
      <div className="fixed bottom-6 left-6 z-9999">
        <button
          type="button"
          onClick={() => setTestLoggedIn((prev) => !prev)}
          className="group flex cursor-pointer items-center gap-2.5 rounded-full border border-white/15 bg-black/80 px-3.5 py-1.5 text-xs text-white/70 shadow-lg backdrop-blur-md transition-all hover:bg-white/10 hover:text-white active:scale-95"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                isEffectiveLoggedIn ? "bg-emerald-400" : "bg-[#FFA336]"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isEffectiveLoggedIn ? "bg-emerald-500" : "bg-[#FFA336]"
              }`}
            />
          </span>
          <span>
            {isEffectiveLoggedIn
              ? "🧪 Test: Đã Đăng Nhập (Click về 50%)"
              : "🧪 Test: Mô phỏng Đăng Nhập (100% Width)"}
          </span>
        </button>
      </div>

      {/* ─── Navbar: Fixed ở trên cùng, hiện khi đã đăng nhập ─── */}
      {isEffectiveLoggedIn && (
        <div className="pointer-events-auto fixed inset-x-0 top-0 z-50">
          <PublicLandingNavbar
            isDarkBg={true}
            isAuthenticated={true}
            user={activeUser}
            className="z-50!"
          />
        </div>
      )}

      {/* ─── Panel Container: 50% khi chưa đăng nhập, 100% fullwidth khi đã đăng nhập ─── */}
      <div
        ref={panelRef}
        className={`relative z-10 flex min-h-screen w-full flex-col will-change-[width] ${
          isEffectiveLoggedIn
            ? "w-full bg-[#050505]"
            : "border-r border-white/8 bg-black/95 shadow-2xl backdrop-blur-md md:w-1/2 md:bg-black"
        }`}
      >
        {/* ─── GIAO DIỆN 1: FORM ĐĂNG NHẬP 50% UI GỐC ĐẦY ĐỦ ─── */}
        <div
          ref={formWrapperRef}
          style={{
            display: isEffectiveLoggedIn ? "none" : "flex",
            opacity: isEffectiveLoggedIn ? 0 : 1,
          }}
          className="flex min-h-screen w-full flex-1 flex-col justify-between px-8 py-8 md:px-14 lg:px-20"
        >
          {/* Header Bar: Logo & Back Link */}
          <div className="flex items-center justify-between">
            <Link to="/" className="group flex items-center">
              <img
                src={logoPicareNewBlack}
                alt="Picare Client"
                className="-my-2 h-7 w-auto object-contain mix-blend-screen transition-opacity hover:opacity-85 sm:h-9 md:h-10"
              />
            </Link>

            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
              >
                <FiArrowLeft className="text-xs" />
                <span>Quay lại</span>
              </button>
            ) : (
              <Link
                to={backTo}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-200"
              >
                <FiArrowLeft className="text-xs" />
                <span>Quay lại</span>
              </Link>
            )}
          </div>

          {/* Form Content */}
          <div className="flex flex-1 flex-col justify-center py-10">
            <div className="mx-auto w-full max-w-130">
              {/* Title & Auth Status - Picare Client. */}
              <div className="mb-10">
                <h1 className="font-haffer text-3xl font-light tracking-[-0.04em] text-white sm:text-4xl">
                  <span className="italic font-light">Picare</span>{" "}
                  <span className="font-normal text-white/90">
                    Client<span className="text-[#FFA336]">.</span>
                  </span>
                </h1>
                <p className="font-haffer mt-2.5 text-[13px] font-light leading-relaxed text-zinc-400">
                  Đăng nhập không gian làm việc và hệ thống quản trị nội bộ tập
                  trung
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium tracking-wide text-zinc-400">
                    Email
                  </label>
                  <div className="group relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      placeholder="name@company.com"
                      className="w-full bg-transparent py-3 text-sm text-white placeholder-zinc-600 transition-all outline-none"
                      required
                    />
                    <div className="absolute bottom-0 h-px w-full bg-white/10" />
                    <motion.div
                      className="absolute bottom-0 h-px w-full origin-left bg-linear-to-r from-[#F86D2B] to-[#FFA336]"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isEmailFocused ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
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
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        placeholder="••••••••"
                        className="w-full bg-transparent py-3 pr-10 text-sm text-white placeholder-zinc-600 transition-all outline-none"
                        required
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
                </div>

                {/* Inline Error */}
                {loginMutation.isError && (
                  <p className="pt-1 text-xs text-red-400">
                    * {getApiErrorMessage(loginMutation.error)}
                  </p>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="group relative mt-8 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-white py-3.5 text-sm font-semibold tracking-wide text-zinc-950 shadow-[0_4px_24px_rgba(255,255,255,0.15)] transition-all duration-200 hover:bg-zinc-100 hover:shadow-[0_6px_30px_rgba(255,255,255,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>
                    {isSubmitting ? "Đang xác thực..." : "Đăng nhập hệ thống"}
                  </span>
                  <FiArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-1" />
                </motion.button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="py-4">
            <p className="text-center font-light text-[11px] text-zinc-600">
              Copyright © {new Date().getFullYear()} Picare Client. All rights
              reserved.
            </p>
          </div>
        </div>

        {/* ─── GIAO DIỆN 2: CHỌN CLIENT (Full screen full width edge-to-edge) ─── */}
        <div
          ref={gridWrapperRef}
          className="relative min-h-screen w-full bg-[#050505] pt-24 pb-12"
          style={{
            display: isEffectiveLoggedIn ? "block" : "none",
            opacity: isEffectiveLoggedIn ? 1 : 0,
          }}
        >
          {/* Outer border frame y chang cũ */}
          <div className="pointer-events-none absolute inset-0 border border-white/[0.07]" />

          {/* Grid y chang cũ fullwidth edge-to-edge */}
          <div className="grid w-full grid-cols-1 border-t border-l border-white/[0.07] md:grid-cols-2 lg:grid-cols-3">
            {isClientsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ClientSkeleton key={i} />
              ))
            ) : (
              <>
                {clientList.map((client, i) => (
                  <ClientCard
                    key={client.clientId}
                    client={client}
                    index={i}
                  />
                ))}
                {Array.from({ length: placeholders }).map((_, i) => (
                  <EmptyCard key={`empty-${i}`} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button (Dự án trong hệ sinh thái) khi ở chế độ 50% form */}
      {!isEffectiveLoggedIn && (
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
