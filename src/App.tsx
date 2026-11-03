import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { FullScreenSpinner } from "@/components/custom_ui/Spinner";
import AppRouter from "./routes/AppRouter";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./hooks/useAuth";
import { ToastContainer } from "./components/ToastContainer";
import { DevtoolsGuard } from "./components/guards/DevtoolsGuard";
import { CurveTransitionProvider } from "@/components/custom_ui/CurvePageTransition";
import UiTrace from "@/components/security/UiTrace";

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <DevtoolsGuard />
          <UiTrace />
          <CurveTransitionProvider>
            <Suspense fallback={<FullScreenSpinner />}>
              <AppRouter />
            </Suspense>
            <ToastContainer />
          </CurveTransitionProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  );
}

function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      {children}
    </QueryClientProvider>
  );
}
