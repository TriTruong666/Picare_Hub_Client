import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import AppRouter from "./routes/AppRouter";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./hooks/useAuth";
import { ToastContainer } from "./components/ToastContainer";
import ModalContainer from "./components/ModalContainer";
import { DevtoolsGuard } from "./components/guards/DevtoolsGuard";
import { CurveTransitionProvider } from "@/components/custom_ui/CurvePageTransition";

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <DevtoolsGuard />
          <CurveTransitionProvider>
            <AppRouter />
            <ModalContainer />
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
