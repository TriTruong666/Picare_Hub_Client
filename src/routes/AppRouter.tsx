import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import { PATHS } from "@/config/paths";
import PrivateRoutes from "./PrivateRoutes";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/dashboard/*" element={<PrivateRoutes />} />

      {/* Public Routes (Landing, Login, etc.) */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
    </Routes>
  );
}
