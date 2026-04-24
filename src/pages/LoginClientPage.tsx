import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import type { HubClient } from "@/types/HubClient";
import loginMockup from "@/assets/images/login_mockup.jpeg";
import { useHubClients } from "@/hooks/data/useHubClientHooks";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/config/paths";

// ─── Card ─────────────────────────────────────────────────────────────────────
function ClientCard({ client, index }: { client: HubClient; index: number }) {
  const navigate = useNavigate();
  const isActive = client.clientStatus === "active";

  const handleAccess = () => {
    if (isActive) {
      navigate(`${PATHS.LOGIN_CLIENT}?clientId=${client.clientId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.06,
        ease: [0.25, 1, 0.5, 1],
      }}
      className="group relative flex flex-col border-r border-b border-white/[0.07] bg-[#050505] transition-colors duration-300 hover:bg-white/2"
    >
      {/* Accent top bar — visible on hover */}
      <div
        className="absolute top-0 left-0 h-px w-0 transition-all duration-1000 group-hover:w-full"
        style={{ background: "#F6C9F9" }}
      />

      <div className="flex flex-1 flex-col p-0">
        {/* Mockup Image Header */}
        <div className="relative aspect-video w-full overflow-hidden border-b border-white/[0.07]">
          <img
            src={client.clientMockupImage || loginMockup}
            alt={client.clientName}
            className="h-full w-full object-cover opacity-60 grayscale transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
          />
        </div>

        <div className="flex flex-1 flex-col px-6 py-6">
          {/* Title */}
          <h2 className="font-bricolage mb-2.5 text-[15px] font-semibold tracking-tight text-white/80 transition-colors duration-300 group-hover:text-white">
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
              onClick={handleAccess}
              disabled={!isActive}
              className="group/btn font-inter flex cursor-pointer items-center gap-1.5 border border-white/10 px-3.5 py-1.5 text-[12px] text-white/35 transition-all duration-200 hover:border-[#a78bfa]/40 hover:text-[#a78bfa] disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:border-white/10 disabled:hover:text-white/35"
            >
              Truy cập
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ClientSkeleton() {
  return (
    <div className="relative flex flex-col border-r border-b border-white/[0.07] bg-[#050505]">
      <div className="aspect-video w-full animate-pulse border-b border-white/[0.07] bg-white/[0.03]" />
      <div className="flex flex-1 flex-col space-y-4 px-6 py-6">
        <div className="h-5 w-32 animate-pulse rounded-full bg-white/5" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.03]" />
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/[0.03]" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-6">
          <div className="flex gap-2">
            <div className="h-5 w-14 animate-pulse border border-white/5 bg-white/1" />
            <div className="h-5 w-14 animate-pulse border border-white/[0.05] bg-white/1" />
          </div>
          <div className="h-8 w-24 animate-pulse border border-white/[0.05] bg-white/[0.01]" />
        </div>
      </div>
    </div>
  );
}

// ─── Empty Placeholder ────────────────────────────────────────────────────────
function EmptyCard() {
  return (
    <div className="relative min-h-[400px] border-r border-b border-white/[0.07] bg-transparent" />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginClientPage() {
  const { data: clients, isLoading } = useHubClients({
    limit: 100,
    status: "active",
  });

  const clientList = clients || [];
  const minSlots = 6;
  const placeholders = Math.max(0, minSlots - clientList.length);

  return (
    <main className="font-inter relative min-h-screen w-full bg-[#050505]">
      {/* Outer border frame */}
      <div className="pointer-events-none absolute inset-0 border border-white/[0.07]" />

      {/* Grid */}
      <div className="grid w-full grid-cols-1 border-t border-l border-white/[0.07] md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <ClientSkeleton key={i} />)
        ) : (
          <>
            {clientList.map((client, i) => (
              <ClientCard key={client.clientId} client={client} index={i} />
            ))}
            {Array.from({ length: placeholders }).map((_, i) => (
              <EmptyCard key={`empty-${i}`} />
            ))}
          </>
        )}
      </div>
    </main>
  );
}
