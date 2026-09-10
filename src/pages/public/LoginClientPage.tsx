import { useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import type { HubClient } from "@/types/HubClient";
import loginMockup from "@/assets/images/login_mockup.jpeg";
import { useHubClients } from "@/hooks/data/useHubClientHooks";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { PATHS } from "@/config/paths";
import {
  DIGITAL_CATALOGUE_CLIENT_ID,
  DIGITAL_CONTRACT_CLIENT_ID,
  QR_CODE_GENERATOR_CLIENT_ID,
  STATIC_HUB_CLIENTS,
} from "@/constants/staticHubClients";
import { useAuth } from "@/hooks/useAuth";
import { useCurveTransition } from "@/components/custom_ui/CurvePageTransition";
import { PublicLandingNavbar } from "@/components/landing/PublicLandingNavbar";

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

// ─── Card (Font Haffer, Animation và Style gần giống LandingPageTest) ─────────
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
      <div className="relative w-full flex-1 overflow-hidden bg-[#0a0a0e]">
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
      <div className="pointer-events-none relative z-10 flex w-full items-end justify-between border-t border-white/[0.06] bg-[#070709] p-5 sm:p-6 lg:p-7">
        <div className="pointer-events-auto flex max-w-[calc(100%-3.5rem)] flex-col text-left">
          <h3 className="font-haffer text-lg font-medium tracking-tight text-white transition-colors group-hover:text-white sm:text-xl lg:text-[22px]">
            {client.clientName}
          </h3>
          {client.clientDescription && (
            <p className="font-haffer mt-1 line-clamp-2 text-xs leading-relaxed font-light text-white/60 transition-colors group-hover:text-white/80 sm:text-[13px]">
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ClientSkeleton() {
  return (
    <div className="relative flex min-h-[360px] sm:min-h-[44vh] lg:min-h-0 lg:h-full flex-col justify-between border-r border-b border-white/[0.08] bg-[#070709]">
      <div className="w-full flex-1 animate-pulse bg-white/3" />
      <div className="flex flex-col space-y-2 border-t border-white/[0.06] p-5 sm:p-6 lg:p-7">
        <div className="h-6 w-36 animate-pulse rounded-full bg-white/5" />
        <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-white/3" />
      </div>
    </div>
  );
}

// ─── Empty Placeholder ────────────────────────────────────────────────────────
function EmptyCard() {
  return (
    <div className="relative flex min-h-[360px] sm:min-h-[44vh] lg:min-h-0 lg:h-full border-r border-b border-white/[0.08] bg-transparent" />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginClientPage() {
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");

  // Nếu có clientId trong URL -> chuyển sang /login để thực hiện xác thực và kiểm tra quyền
  if (clientId) {
    return <Navigate to={`${PATHS.LOGIN}?clientId=${clientId}`} replace />;
  }

  const { data: clients, isLoading } = useHubClients({
    limit: 100,
    status: "active",
  });

  const clientList = [...(clients || []), ...STATIC_HUB_CLIENTS];

  return (
    <div className="relative min-h-screen min-h-dvh w-full overflow-x-hidden overflow-y-auto bg-[#050505] lg:h-screen lg:overflow-hidden">
      {/* Navbar: cố định ở trên cùng đè lên, không có background */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
        <PublicLandingNavbar
          isDarkBg={false}
          className="z-50"
        />
      </div>

      {/* Main Grid: Full Screen, Full Height 100vh Edge-to-Edge - Slide in from Left to Right */}
      <motion.main
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative min-h-screen w-full bg-[#050505] pt-24 pb-14 sm:pt-28 lg:h-screen lg:p-0"
      >
        {/* Outer border frame */}
        <div className="pointer-events-none absolute inset-0 border border-white/[0.08]" />

        {/* Grid 6 items: Exactly 3 cols x 2 rows = full screen 100vh trên desktop */}
        <div className="grid h-auto min-h-full w-full grid-cols-1 border-t border-l border-white/[0.08] md:grid-cols-2 lg:h-full lg:grid-cols-3 lg:grid-rows-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <ClientSkeleton key={i} />)
          ) : (
            <>
              {clientList.slice(0, 6).map((client, i) => (
                <ClientCard key={client.clientId} client={client} index={i} />
              ))}
              {Array.from({
                length: Math.max(0, 6 - Math.min(6, clientList.length)),
              }).map((_, i) => (
                <EmptyCard key={`empty-${i}`} />
              ))}
            </>
          )}
        </div>
      </motion.main>
    </div>
  );
}
