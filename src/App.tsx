import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          {/* Picare Hub — Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard & Private pages — will be added when auth is restored */}
          {/* <Route path="/dashboard/*" element={<AuthGuard><PrivateRoute /></AuthGuard>} /> */}
        </Routes>
      </BrowserRouter>
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
