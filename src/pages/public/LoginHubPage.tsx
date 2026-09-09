import { Navigate, useSearchParams } from "react-router-dom";
import AeroShards from "@/components/reactbit/AeroShard";
import LoginHubFormSection from "@/components/custom_ui/LoginHubFormSection";
import { useAuth } from "@/hooks/useAuth";
import { PATHS } from "@/config/paths";
import { canAccessDashboard } from "@/config/dashboardAccess";

function getSafeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return PATHS.HOME;
  }

  if (value.startsWith(PATHS.LOGIN_HUB)) {
    return PATHS.HOME;
  }

  return value;
}

export default function LoginHubPage() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));
  const isDashboardRedirect = redirectPath.startsWith(PATHS.DASHBOARD.ROOT);

  if (
    isAuthenticated &&
    isDashboardRedirect &&
    !canAccessDashboard(user?.role)
  ) {
    return <Navigate to={PATHS.HOME} replace />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="font-haffer relative min-h-screen w-full overflow-hidden bg-[#120F17] select-none">
      {/* Background WebGPU AeroShards */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        <AeroShards
          backgroundColor="#120F17"
          shardColor="#F86D2B"
          accentColor="#FFA336"
          placement="right"
          flow="stream"
          material="satin"
          detail="balanced"
          effect="none"
          scale={1}
          spread={1}
          depth={1}
          speed={1}
          spin={1}
          interaction="repel"
          density={1.5}
          shardSize={1.1}
          stretch={1}
          turbulence={1}
          glow={1}
          edgeSoftness={2}
          bloom={0.5}
          grain={0.05}
          chromaticAberration={0.0075}
          transitionDuration={1.2}
          interactionRadius={1.5}
          interactionStrength={0.5}
          rippleIntensity={1}
          holdToGather
          paused={false}
        />
      </div>

      {/* Foreground Form */}
      <div className="relative z-10 min-h-screen w-full">
        <LoginHubFormSection backTo="/test" />
      </div>
    </div>
  );
}
