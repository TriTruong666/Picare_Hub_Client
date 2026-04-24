import { Routes, Route, Navigate } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import { PATHS } from "@/config/paths";

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes (Landing, Login, etc.) */}
      <Route path="/*" element={<PublicRoutes />} />

      {/* Private Routes Placeholder */}
      {/* <Route path="/dashboard/*" element={<PrivateRoutes />} /> */}

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
    </Routes>
  );
}
