import { PATHS } from "@/config/paths";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import LandingHeader from "../../components/landing/LandingHeader";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen bg-[#050505]">
      <LandingHeader />
      <section className="flex min-h-screen items-center justify-center px-6 pt-24">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="font-bricolage text-[36px] font-medium text-white/40 uppercase">
            Picare Hub hiện đang trong quá trình phát triển
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={PATHS.LOGIN}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-95"
                >
                  Bắt đầu công việc
                </Link>
                <Link
                  to={PATHS.DASHBOARD.ROOT}
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
                >
                  Vào dashboard
                </Link>
              </>
            ) : (
              <Link
                to={PATHS.LOGIN_HUB}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-95"
              >
                Dang nhap vao Hub
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
